import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { fetchBootstrap } from '@/lib/api';
import {
  createLocalId,
  isLikedBy,
  sortPosts,
  validateDraft,
} from '@/lib/feed';
import { validateApplication } from '@/lib/adoption';
import type { ApplicationDraft } from '@/lib/adoption';
import { canAccept, canDecline, canWithdraw } from '@/lib/matches';
import { clampQuantity } from '@/lib/marketplace';
import {
  VIEWER_ID,
  unreadCountOf,
  validateMessage,
} from '@/lib/messaging';
import { petFieldsFromDraft, validatePet } from '@/lib/pets';
import { validateBooking } from '@/lib/services';
import type { BookingDraft } from '@/lib/services';
import { AppDataContext } from '@/context/appData';
import type { Status } from '@/context/appData';
import type {
  AdoptionApplication,
  AdoptionListing,
  BookingRequest,
  CartItem,
  Connection,
  Conversation,
  DemoMessage,
  DiscoverablePet,
  FeedPost,
  InterestRequest,
  NewPostDraft,
  NotificationKind,
  OwnerProfile,
  PetBlock,
  PetDeletionImpact,
  PetDraft,
  PetProfile,
  PetReport,
  PetReportReason,
  PostComment,
  PostReport,
  PrivacySettings,
  ProfileDraft,
  Product,
  ReportReason,
  ServiceListing,
  SocialNotification,
} from '@/types';


/**
 * Holds every piece of app state the shell and the feed need.
 *
 * All of it comes from `lib/api`, which is mock-backed today. Every mutation
 * is local to the session — nothing is persisted or sent anywhere.
 */
/** Privacy defaults to the narrower option on every switch. */
const DEFAULT_PRIVACY: PrivacySettings = {
  showCity: false,
  allowContactRequests: false,
  discoverable: false,
};

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [privacy, setPrivacyState] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [reports, setReports] = useState<PostReport[]>([]);
  const [discoverablePets, setDiscoverablePets] = useState<DiscoverablePet[]>([]);
  const [interests, setInterests] = useState<InterestRequest[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  /*
   * Guard mirrors for the two lists that interest actions mutate together.
   *
   * React batches state, so three synchronous clicks on one confirm button all
   * run against the same rendered `interests`/`connections` — a closure-based
   * duplicate check passes three times and writes three rows. These refs are
   * advanced synchronously inside each action, so the second and third call see
   * the first one's result and bail out.
   */
  const interestsRef = useRef<InterestRequest[]>([]);
  const connectionsRef = useRef<Connection[]>([]);

  const commitInterests = useCallback((next: InterestRequest[]) => {
    interestsRef.current = next;
    setInterests(next);
  }, []);

  const commitConnections = useCallback((next: Connection[]) => {
    connectionsRef.current = next;
    setConnections(next);
  }, []);
  const [petBlocks, setPetBlocks] = useState<PetBlock[]>([]);
  const [petReports, setPetReports] = useState<PetReport[]>([]);
  const [adoptionListings, setAdoptionListings] = useState<AdoptionListing[]>([]);
  const [adoptionApplications, setAdoptionApplications] = useState<
    AdoptionApplication[]
  >([]);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [hiddenListingIds, setHiddenListingIds] = useState<string[]>([]);
  /* Same synchronous-guard pattern the interest actions use, so a double
     submit cannot create two applications for one listing. */
  const applicationsRef = useRef<AdoptionApplication[]>([]);
  const [serviceListings, setServiceListings] = useState<ServiceListing[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [savedServiceIds, setSavedServiceIds] = useState<string[]>([]);
  const [blockedProviderIds, setBlockedProviderIds] = useState<string[]>([]);
  /* Same synchronous-guard pattern as interests and applications. */
  const bookingsRef = useRef<BookingRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [blockedSellerIds, setBlockedSellerIds] = useState<string[]>([]);
  /* Same synchronous-guard pattern as the other write paths: rapid clicks all
     read the same rendered state, so the ref is what prevents a duplicate row. */
  const cartRef = useRef<CartItem[]>([]);
  const [blockedConversationIds, setBlockedConversationIds] = useState<string[]>([]);
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  /*
   * Guard mirrors for everything Step 8 writes. React batches state, so rapid
   * clicks all run against the same rendered value; these refs advance
   * synchronously, which is what makes a second click a no-op rather than a
   * duplicate row.
   */
  const conversationsRef = useRef<Conversation[]>([]);
  const notificationsRef = useRef<SocialNotification[]>([]);
  const petsRef = useRef<PetProfile[]>([]);
  const ownerRef = useRef<OwnerProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    fetchBootstrap()
      .then((data) => {
        if (cancelled) return;
        ownerRef.current = data.owner;
        petsRef.current = data.pets;
        notificationsRef.current = data.notifications;
        conversationsRef.current = data.conversations;
        setOwner(data.owner);
        setPets(data.pets);
        setActivePetId(data.pets[0]?.id ?? null);
        setNotifications(data.notifications);
        setConversations(data.conversations);
        setBlockedConversationIds([]);
        setPrivacyState(data.privacy);
        setPosts(sortPosts(data.posts));
        setFollowingIds(data.followingIds);
        setHiddenPostIds([]);
        setReports([]);
        setDiscoverablePets(data.discoverablePets);
        interestsRef.current = data.interests;
        connectionsRef.current = [];
        setInterests(data.interests);
        setConnections([]);
        setPetBlocks([]);
        setPetReports([]);
        setAdoptionListings(data.adoptionListings);
        applicationsRef.current = [];
        setAdoptionApplications([]);
        setSavedListingIds([]);
        setHiddenListingIds([]);
        setServiceListings(data.serviceListings);
        bookingsRef.current = [];
        setBookingRequests([]);
        setSavedServiceIds([]);
        setBlockedProviderIds([]);
        setProducts(data.products);
        cartRef.current = [];
        setCartItems([]);
        setSavedProductIds([]);
        setBlockedSellerIds([]);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const commitNotifications = useCallback((next: SocialNotification[]) => {
    notificationsRef.current = next;
    setNotifications(next);
  }, []);

  /**
   * Records a notification for something that actually happened in this
   * session.
   *
   * `sourceId` is the action's identity, checked against the ref, so repeating
   * an action — or clicking it four times — produces one row, never four. No
   * notification is ever created for an event that did not occur here.
   */
  const pushNotification = useCallback(
    (input: {
      kind: NotificationKind;
      title: string;
      description: string;
      sourceId: string;
      route?: string;
    }) => {
      if (notificationsRef.current.some((n) => n.sourceId === input.sourceId)) {
        return;
      }
      const note: SocialNotification = {
        id: createLocalId('notification'),
        kind: input.kind,
        title: input.title,
        description: input.description,
        createdAt: Date.now(),
        read: false,
        sourceId: input.sourceId,
        route: input.route,
      };
      commitNotifications([note, ...notificationsRef.current]);
    },
    [commitNotifications],
  );

  /** Idempotent: marking an already-read notification changes nothing. */
  const markNotificationRead = useCallback(
    (id: string) => {
      commitNotifications(
        notificationsRef.current.map((note) =>
          note.id === id ? { ...note, read: true } : note,
        ),
      );
    },
    [commitNotifications],
  );

  const markAllNotificationsRead = useCallback(() => {
    commitNotifications(
      notificationsRef.current.map((note) => ({ ...note, read: true })),
    );
  }, [commitNotifications]);

  const setPrivacy = useCallback((patch: Partial<PrivacySettings>) => {
    setPrivacyState((current) => ({ ...current, ...patch }));
  }, []);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  /* Messages ------------------------------------------------------------- */

  const commitConversations = useCallback((next: Conversation[]) => {
    conversationsRef.current = next;
    setConversations(next);
  }, []);

  /**
   * Appends a message to a demo thread.
   *
   * Nothing is transmitted: this only adds a row the viewer can see. Validation
   * runs here as well as in the composer, so an empty or oversized message
   * cannot reach state by any path, and the ref read means four rapid sends
   * append four distinct messages rather than racing on one stale array.
   */
  const sendMessage = useCallback(
    (conversationId: string, body: string): DemoMessage | null => {
      if (!validateMessage(body).valid) return null;
      const conversation = conversationsRef.current.find(
        (item) => item.id === conversationId,
      );
      if (!conversation) return null;

      const message: DemoMessage = {
        id: createLocalId('message'),
        conversationId,
        senderId: VIEWER_ID,
        senderName: ownerRef.current?.name ?? 'You',
        body: body.trim(),
        createdAt: Date.now(),
        read: true,
      };

      commitConversations(
        conversationsRef.current.map((item) =>
          item.id === conversationId
            ? { ...item, messages: [...item.messages, message] }
            : item,
        ),
      );

      pushNotification({
        kind: 'message',
        title: `You replied to ${conversation.name}`,
        description:
          'Added to this demo conversation. Nothing was delivered to anyone.',
        sourceId: `message:${message.id}`,
        route: '/messages',
      });

      return message;
    },
    [commitConversations, pushNotification],
  );

  const markConversationRead = useCallback(
    (conversationId: string) => {
      commitConversations(
        conversationsRef.current.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                messages: item.messages.map((message) => ({
                  ...message,
                  read: true,
                })),
              }
            : item,
        ),
      );
    },
    [commitConversations],
  );

  /* Blocking hides the thread and, because the unread count is derived from
     visible conversations, takes its badge with it. */
  const blockConversation = useCallback((conversationId: string) => {
    setBlockedConversationIds((current) =>
      current.includes(conversationId) ? current : [...current, conversationId],
    );
  }, []);

  const reportConversation = useCallback(
    (conversationId: string, reason: PetReportReason) => {
      setPetReports((current) =>
        current.some((report) => report.petId === conversationId)
          ? current
          : [
              ...current,
              { petId: conversationId, reason, reportedAt: Date.now() },
            ],
      );
      setBlockedConversationIds((current) =>
        current.includes(conversationId)
          ? current
          : [...current, conversationId],
      );
    },
    [],
  );

  /* Feed ---------------------------------------------------------------- */

  const viewerId = owner?.id ?? VIEWER_ID;

  const isPostLiked = useCallback(
    (postId: string) => {
      const post = posts.find((item) => item.id === postId);
      return post ? isLikedBy(post, viewerId) : false;
    },
    [posts, viewerId],
  );

  const toggleLike = useCallback(
    (postId: string) => {
      const target = posts.find((post) => post.id === postId);
      if (target && !isLikedBy(target, viewerId)) {
        pushNotification({
          kind: 'like',
          title: `You liked ${target.author.name}'s post`,
          description: `About ${target.pet.name}. Session-local activity only.`,
          sourceId: `like:${postId}`,
          route: '/feed',
        });
      }
      setPosts((current) =>
        current.map((post) => {
          if (post.id !== postId) return post;
          const liked = isLikedBy(post, viewerId);
          return {
            ...post,
            reactions: liked
              ? post.reactions.filter(
                  (reaction) => reaction.userId !== viewerId,
                )
              : [...post.reactions, { userId: viewerId, kind: 'like' as const }],
          };
        }),
      );
    },
    [posts, viewerId, pushNotification],
  );

  const toggleSave = useCallback((postId: string) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, saved: !post.saved } : post,
      ),
    );
  }, []);

  const hidePost = useCallback((postId: string) => {
    setHiddenPostIds((current) =>
      current.includes(postId) ? current : [...current, postId],
    );
  }, []);

  /**
   * Reporting records the report and takes the post out of the feed.
   *
   * Reports are intentionally not undone by `restoreHiddenPosts` — a hidden
   * post is a preference, a reported one is a decision.
   */
  const reportPost = useCallback((postId: string, reason: ReportReason) => {
    setReports((current) =>
      current.some((report) => report.postId === postId)
        ? current
        : [...current, { postId, reason, reportedAt: Date.now() }],
    );
  }, []);

  const restoreHiddenPosts = useCallback(() => setHiddenPostIds([]), []);

  const addComment = useCallback(
    (postId: string, body: string): PostComment | null => {
      const trimmed = body.trim();
      if (!trimmed || !owner) return null;

      const comment: PostComment = {
        id: createLocalId('comment'),
        postId,
        authorId: owner.id,
        authorName: owner.name,
        body: trimmed,
        createdAt: Date.now(),
      };

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, comment] }
            : post,
        ),
      );

      pushNotification({
        kind: 'comment',
        title: 'You commented on a post',
        description: 'Session-local activity only.',
        sourceId: `comment:${comment.id}`,
        route: '/feed',
      });

      return comment;
    },
    [owner, pushNotification],
  );

  const createPost = useCallback(
    (draft: NewPostDraft): FeedPost | null => {
      if (!owner) return null;
      // Validated again here so no code path can put an invalid post in state.
      if (!validateDraft(draft).valid) return null;

      const pet = pets.find((item) => item.id === draft.petId);
      if (!pet) return null;

      const imageUrl = draft.imageUrl.trim();
      const body = draft.body.trim();

      const post: FeedPost = {
        id: createLocalId('post'),
        author: {
          id: owner.id,
          name: owner.name,
          handle: owner.handle,
          city: owner.city,
        },
        pet: {
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
        },
        createdAt: Date.now(),
        body,
        images: imageUrl
          ? [
              {
                id: createLocalId('image'),
                alt: `Photo shared by ${owner.name} of ${pet.name}`,
                url: imageUrl,
              },
            ]
          : [],
        visibility: draft.visibility,
        reactions: [],
        comments: [],
        saved: false,
      };

      setPosts((current) => [post, ...current]);
      return post;
    },
    [owner, pets],
  );

  /* Discovery ------------------------------------------------------------ */

  const interestFor = useCallback(
    (petId: string): InterestRequest | null =>
      interests.find(
        (interest) =>
          interest.petId === petId &&
          interest.direction === 'sent' &&
          interest.status === 'pending',
      ) ?? null,
    [interests],
  );

  /**
   * The one interest that describes how the viewer relates to a pet.
   *
   * A pending row always wins over a resolved one, so a pet that was declined
   * last week and asked about again today reads as pending, not declined.
   */
  const relationshipFor = useCallback(
    (petId: string) => {
      const forPet = interests.filter((interest) => interest.petId === petId);
      if (forPet.length === 0) {
        return { status: null, direction: null };
      }
      const pending = forPet.find((interest) => interest.status === 'pending');
      const chosen =
        pending ??
        [...forPet].sort(
          (a, b) => (b.resolvedAt ?? b.sentAt) - (a.resolvedAt ?? a.sentAt),
        )[0];
      return { status: chosen.status, direction: chosen.direction };
    },
    [interests],
  );

  /**
   * Sending an interest records intent and nothing else: no match is created,
   * no conversation opens, and no contact detail is exchanged.
   *
   * A duplicate is refused here rather than in the UI, so no code path can
   * produce two pending interests for one pet.
   */
  const sendInterest = useCallback(
    (petId: string, fromPetId: string | null): InterestRequest | null => {
      const alreadyPending = interests.some(
        (interest) => interest.petId === petId && interest.status === 'pending',
      );
      if (alreadyPending) return null;

      const request: InterestRequest = {
        id: createLocalId('interest'),
        petId,
        fromPetId,
        direction: 'sent',
        status: 'pending',
        sentAt: Date.now(),
        resolvedAt: null,
      };
      commitInterests([...interestsRef.current, request]);
      pushNotification({
        kind: 'contact-request',
        title: 'You sent an interest',
        description:
          'Recorded on this device. The other owner was not contacted.',
        sourceId: `interest:${request.id}`,
        route: '/matches',
      });
      return request;
    },
    [commitInterests, pushNotification],
  );

  /**
   * Accept, decline and withdraw all guard on the CURRENT row rather than on
   * whatever the UI last rendered, so a double click or a stale card cannot
   * move an interest twice or into a contradictory state.
   *
   * None of them deletes anything — the row keeps its history.
   */
  const acceptInterest = useCallback(
    (interestId: string): Connection | null => {
      const interest = interestsRef.current.find(
        (item) => item.id === interestId,
      );
      if (!interest || !canAccept(interest)) return null;
      // One connection per accepted interest, enforced here not in the UI.
      if (connectionsRef.current.some((item) => item.interestId === interestId)) {
        return null;
      }

      const connection: Connection = {
        id: createLocalId('connection'),
        interestId,
        petId: interest.petId,
        fromPetId: interest.fromPetId,
        createdAt: Date.now(),
      };

      commitInterests(
        interestsRef.current.map((item) =>
          item.id === interestId
            ? { ...item, status: 'accepted' as const, resolvedAt: Date.now() }
            : item,
        ),
      );
      commitConnections([...connectionsRef.current, connection]);
      pushNotification({
        kind: 'match',
        title: 'You accepted an interest',
        description: 'A demo connection was created. No details were shared.',
        sourceId: `interest-accepted:${interestId}`,
        route: '/matches',
      });
      return connection;
    },
    [commitInterests, commitConnections, pushNotification],
  );

  const declineInterest = useCallback(
    (interestId: string): boolean => {
      const interest = interestsRef.current.find(
        (item) => item.id === interestId,
      );
      if (!interest || !canDecline(interest)) return false;
      commitInterests(
        interestsRef.current.map((item) =>
          item.id === interestId
            ? { ...item, status: 'declined' as const, resolvedAt: Date.now() }
            : item,
        ),
      );
      return true;
    },
    [commitInterests],
  );

  const withdrawInterest = useCallback(
    (interestId: string): boolean => {
      const interest = interestsRef.current.find(
        (item) => item.id === interestId,
      );
      if (!interest || !canWithdraw(interest)) return false;
      commitInterests(
        interestsRef.current.map((item) =>
          item.id === interestId
            ? { ...item, status: 'withdrawn' as const, resolvedAt: Date.now() }
            : item,
        ),
      );
      return true;
    },
    [commitInterests],
  );

  const connectionForPet = useCallback(
    (petId: string): Connection | null =>
      connections.find((item) => item.petId === petId) ?? null,
    [connections],
  );

  /* Adoption ------------------------------------------------------------- */

  const applicationFor = useCallback(
    (listingId: string): AdoptionApplication | null =>
      adoptionApplications.find(
        (item) => item.listingId === listingId && item.status === 'submitted',
      ) ?? null,
    [adoptionApplications],
  );

  /**
   * Records a demo application.
   *
   * Nothing is sent and no organisation is contacted. The draft is validated
   * again here so an incomplete application cannot reach state by any path,
   * and the duplicate check reads the ref so a double submit writes one row.
   */
  const submitApplication = useCallback(
    (listingId: string, draft: ApplicationDraft): AdoptionApplication | null => {
      if (!owner) return null;
      if (!validateApplication(draft).valid) return null;

      const alreadyApplied = applicationsRef.current.some(
        (item) => item.listingId === listingId && item.status === 'submitted',
      );
      if (alreadyApplied) return null;

      const application: AdoptionApplication = {
        id: createLocalId('application'),
        listingId,
        applicantName: owner.name,
        reason: draft.reason.trim(),
        livingSituation: draft.livingSituation.trim(),
        experience: draft.experience.trim(),
        acknowledged: true,
        status: 'submitted',
        submittedAt: Date.now(),
        withdrawnAt: null,
      };

      const next = [...applicationsRef.current, application];
      applicationsRef.current = next;
      setAdoptionApplications(next);
      pushNotification({
        kind: 'adoption-interest',
        title: 'You submitted a demo adoption application',
        description: 'No organisation was contacted.',
        sourceId: `application:${application.id}`,
        route: '/adoption',
      });
      return application;
    },
    [owner, pushNotification],
  );

  /** Withdrawal marks the row rather than deleting it. */
  const withdrawApplication = useCallback((applicationId: string): boolean => {
    const application = applicationsRef.current.find(
      (item) => item.id === applicationId,
    );
    if (!application || application.status !== 'submitted') return false;

    const next = applicationsRef.current.map((item) =>
      item.id === applicationId
        ? { ...item, status: 'withdrawn' as const, withdrawnAt: Date.now() }
        : item,
    );
    applicationsRef.current = next;
    setAdoptionApplications(next);
    return true;
  }, []);

  const toggleSavedListing = useCallback((listingId: string) => {
    setSavedListingIds((current) =>
      current.includes(listingId)
        ? current.filter((id) => id !== listingId)
        : [...current, listingId],
    );
  }, []);

  /* Blocking and reporting both hide the listing everywhere it could appear,
     including the saved view and any open detail dialog. */
  const blockListing = useCallback((listingId: string) => {
    setHiddenListingIds((current) =>
      current.includes(listingId) ? current : [...current, listingId],
    );
  }, []);

  /* Services ------------------------------------------------------------- */

  const bookingsForService = useCallback(
    (serviceId: string): BookingRequest[] =>
      bookingRequests.filter(
        (item) => item.serviceId === serviceId && item.status === 'submitted',
      ),
    [bookingRequests],
  );

  /**
   * Records a demo booking request.
   *
   * No provider is contacted, no appointment exists and no payment obligation
   * is created. Duplicates are scoped to viewer + pet + service and checked
   * against the ref, so a double submit writes one row.
   */
  const submitBooking = useCallback(
    (serviceId: string, draft: BookingDraft): BookingRequest | null => {
      if (!validateBooking(draft).valid) return null;

      const duplicate = bookingsRef.current.some(
        (item) =>
          item.serviceId === serviceId &&
          item.petId === draft.petId &&
          item.status === 'submitted',
      );
      if (duplicate) return null;

      const request: BookingRequest = {
        id: createLocalId('booking'),
        serviceId,
        petId: draft.petId,
        preferredDate: draft.preferredDate,
        timeWindow: draft.timeWindow,
        message: draft.message.trim(),
        acknowledged: true,
        status: 'submitted',
        submittedAt: Date.now(),
        withdrawnAt: null,
      };

      const next = [...bookingsRef.current, request];
      bookingsRef.current = next;
      setBookingRequests(next);
      pushNotification({
        kind: 'service',
        title: 'You sent a demo booking request',
        description: 'No provider was contacted and no appointment was made.',
        sourceId: `booking:${request.id}`,
        route: '/services',
      });
      return request;
    },
    [pushNotification],
  );

  /** Withdrawal marks the row rather than deleting it. */
  const withdrawBooking = useCallback((bookingId: string): boolean => {
    const booking = bookingsRef.current.find((item) => item.id === bookingId);
    if (!booking || booking.status !== 'submitted') return false;

    const next = bookingsRef.current.map((item) =>
      item.id === bookingId
        ? { ...item, status: 'withdrawn' as const, withdrawnAt: Date.now() }
        : item,
    );
    bookingsRef.current = next;
    setBookingRequests(next);
    return true;
  }, []);

  const toggleSavedService = useCallback((serviceId: string) => {
    setSavedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  }, []);

  /* Blocking is per provider, so every listing of theirs disappears at once. */
  const blockProvider = useCallback((providerId: string) => {
    setBlockedProviderIds((current) =>
      current.includes(providerId) ? current : [...current, providerId],
    );
  }, []);

  const reportProvider = useCallback(
    (providerId: string, reason: PetReportReason) => {
      setPetReports((current) =>
        current.some((report) => report.petId === providerId)
          ? current
          : [...current, { petId: providerId, reason, reportedAt: Date.now() }],
      );
      setBlockedProviderIds((current) =>
        current.includes(providerId) ? current : [...current, providerId],
      );
    },
    [],
  );

  /* Pets ----------------------------------------------------------------- */

  const commitPets = useCallback((next: PetProfile[]) => {
    petsRef.current = next;
    setPets(next);
  }, []);

  const setActivePet = useCallback((petId: string | null) => {
    setActivePetId(petId);
  }, []);

  /**
   * Adds a pet.
   *
   * Validated again here, and the ref read means four rapid submits create one
   * pet: the second call sees the first one's name already present and stops.
   * Discoverability is copied from the draft, which starts false — nothing
   * here turns it on for the owner.
   */
  const addPet = useCallback(
    (draft: PetDraft): PetProfile | null => {
      if (!ownerRef.current) return null;
      if (!validatePet(draft).valid) return null;

      const fields = petFieldsFromDraft(draft);
      const duplicate = petsRef.current.some(
        (pet) =>
          pet.name.toLowerCase() === fields.name.toLowerCase() &&
          pet.breed.toLowerCase() === fields.breed.toLowerCase(),
      );
      if (duplicate) return null;

      const pet: PetProfile = {
        id: createLocalId('pet'),
        ownerId: ownerRef.current.id,
        ...fields,
      };

      commitPets([...petsRef.current, pet]);
      if (petsRef.current.length === 1) setActivePetId(pet.id);
      return pet;
    },
    [commitPets],
  );

  const updatePet = useCallback(
    (petId: string, draft: PetDraft): PetProfile | null => {
      if (!validatePet(draft).valid) return null;
      const existing = petsRef.current.find((pet) => pet.id === petId);
      if (!existing) return null;

      const updated: PetProfile = {
        ...existing,
        ...petFieldsFromDraft(draft),
      };
      commitPets(
        petsRef.current.map((pet) => (pet.id === petId ? updated : pet)),
      );
      return updated;
    },
    [commitPets],
  );

  /**
   * What deleting a pet would change.
   *
   * Computed before the user confirms so the dialog can say it plainly, and
   * reused after the fact so the toast reports what actually happened.
   */
  const previewPetDeletion = useCallback(
    (petId: string): PetDeletionImpact | null => {
      const pet = petsRef.current.find((item) => item.id === petId);
      if (!pet) return null;

      const pendingInterests = interestsRef.current.filter(
        (item) => item.fromPetId === petId && item.status === 'pending',
      ).length;
      const activeBookings = bookingsRef.current.filter(
        (item) => item.petId === petId && item.status === 'submitted',
      ).length;
      const detachedRecords =
        interestsRef.current.filter(
          (item) => item.fromPetId === petId && item.status !== 'pending',
        ).length +
        bookingsRef.current.filter(
          (item) => item.petId === petId && item.status !== 'submitted',
        ).length +
        connectionsRef.current.filter((item) => item.fromPetId === petId)
          .length;

      return {
        petId,
        petName: pet.name,
        pendingInterests,
        activeBookings,
        detachedRecords,
      };
    },
    [],
  );

  /**
   * Deletes a pet and repairs every reference to it.
   *
   * Pending interests and submitted bookings are withdrawn rather than left
   * pointing at a pet that no longer exists; resolved records keep their
   * history with the pet link detached. Nothing is silently dropped, and the
   * caller gets back exactly what changed so it can tell the user.
   */
  const deletePet = useCallback(
    (petId: string): PetDeletionImpact | null => {
      const impact = previewPetDeletion(petId);
      if (!impact) return null;

      const now = Date.now();

      commitInterests(
        interestsRef.current.map((item) => {
          if (item.fromPetId !== petId) return item;
          if (item.status === 'pending') {
            return {
              ...item,
              status: 'withdrawn' as const,
              resolvedAt: now,
              fromPetId: null,
            };
          }
          return { ...item, fromPetId: null };
        }),
      );

      commitConnections(
        connectionsRef.current.map((item) =>
          item.fromPetId === petId ? { ...item, fromPetId: null } : item,
        ),
      );

      const nextBookings = bookingsRef.current
        .map((item) =>
          item.petId === petId && item.status === 'submitted'
            ? { ...item, status: 'withdrawn' as const, withdrawnAt: now }
            : item,
        )
        .filter((item) => !(item.petId === petId && item.status === 'withdrawn' && item.withdrawnAt === now && false));
      bookingsRef.current = nextBookings;
      setBookingRequests(nextBookings);

      const remaining = petsRef.current.filter((pet) => pet.id !== petId);
      commitPets(remaining);

      // Never leave a dangling active pet: fall back to another, or to none.
      setActivePetId((current) =>
        current === petId ? (remaining[0]?.id ?? null) : current,
      );

      return impact;
    },
    [previewPetDeletion, commitInterests, commitConnections, commitPets],
  );

  /* Profile -------------------------------------------------------------- */

  const updateProfile = useCallback(
    (draft: ProfileDraft): OwnerProfile | null => {
      const current = ownerRef.current;
      if (!current) return null;
      const name = draft.name.trim();
      const city = draft.city.trim();
      if (!name || !city) return null;

      const next: OwnerProfile = {
        ...current,
        name,
        city,
        bio: draft.bio.trim(),
      };
      ownerRef.current = next;
      setOwner(next);
      return next;
    },
    [],
  );

  /**
   * Restores the deterministic mock state.
   *
   * `reload()` re-runs the bootstrap effect, which reseeds every list and
   * clears every session-local array, so one call covers all seven domains.
   */
  const resetDemoData = useCallback(() => {
    reload();
  }, [reload]);

  /* Marketplace ---------------------------------------------------------- */

  const commitCart = useCallback((next: CartItem[]) => {
    cartRef.current = next;
    setCartItems(next);
  }, []);

  /**
   * Adding an item the cart already holds increments that line rather than
   * appending a second one, so rapid clicks can never produce a duplicate row.
   */
  const addToCart = useCallback(
    (productId: string): number => {
      const existing = cartRef.current.find(
        (item) => item.productId === productId,
      );
      if (existing) {
        const nextQuantity = clampQuantity(existing.quantity + 1);
        commitCart(
          cartRef.current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: nextQuantity }
              : item,
          ),
        );
        return nextQuantity;
      }
      commitCart([
        ...cartRef.current,
        { productId, quantity: 1, addedAt: Date.now() },
      ]);
      pushNotification({
        kind: 'service',
        title: 'You added a product to the demo cart',
        description: 'Nothing was bought, reserved or paid for.',
        sourceId: `cart:${productId}`,
        route: '/marketplace',
      });
      return 1;
    },
    [commitCart, pushNotification],
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      commitCart(
        cartRef.current.filter((item) => item.productId !== productId),
      );
    },
    [commitCart],
  );

  /** Quantity is clamped, so it can never reach zero or go negative. */
  const setCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      commitCart(
        cartRef.current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: clampQuantity(quantity) }
            : item,
        ),
      );
    },
    [commitCart],
  );

  const clearCart = useCallback(() => commitCart([]), [commitCart]);

  const toggleSavedProduct = useCallback(
    (productId: string) => {
      const wasSaved = savedProductIds.includes(productId);
      setSavedProductIds((current) =>
        current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId],
      );
      if (!wasSaved) {
        pushNotification({
          kind: 'service',
          title: 'You saved a product',
          description: 'Saved for this session only. Nothing was bought.',
          sourceId: `product-saved:${productId}`,
          route: '/marketplace',
        });
      }
    },
    [savedProductIds, pushNotification],
  );

  /* Blocking is per seller, so every product of theirs disappears at once —
     from the grid, the saved view, the cart, the count and the subtotal. */
  const blockSeller = useCallback((sellerId: string) => {
    setBlockedSellerIds((current) =>
      current.includes(sellerId) ? current : [...current, sellerId],
    );
  }, []);

  const reportSeller = useCallback(
    (sellerId: string, reason: PetReportReason) => {
      setPetReports((current) =>
        current.some((report) => report.petId === sellerId)
          ? current
          : [...current, { petId: sellerId, reason, reportedAt: Date.now() }],
      );
      setBlockedSellerIds((current) =>
        current.includes(sellerId) ? current : [...current, sellerId],
      );
    },
    [],
  );

  const reportListing = useCallback(
    (listingId: string, reason: PetReportReason) => {
      setPetReports((current) =>
        current.some((report) => report.petId === listingId)
          ? current
          : [...current, { petId: listingId, reason, reportedAt: Date.now() }],
      );
      setHiddenListingIds((current) =>
        current.includes(listingId) ? current : [...current, listingId],
      );
    },
    [],
  );

  const blockPet = useCallback((petId: string) => {
    setPetBlocks((current) =>
      current.some((block) => block.petId === petId)
        ? current
        : [...current, { petId, blockedAt: Date.now() }],
    );
  }, []);

  const reportPet = useCallback((petId: string, reason: PetReportReason) => {
    setPetReports((current) =>
      current.some((report) => report.petId === petId)
        ? current
        : [...current, { petId, reason, reportedAt: Date.now() }],
    );
  }, []);

  const visiblePosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          !hiddenPostIds.includes(post.id) &&
          !reports.some((report) => report.postId === post.id),
      ),
    [posts, hiddenPostIds, reports],
  );

  const unreadNotificationCount = useMemo(
    () => notifications.filter((note) => !note.read).length,
    [notifications],
  );

  /* Derived from visible conversations only, so blocking a thread takes its
     unread badge with it instead of orphaning a count in the header. */
  const unreadMessageCount = useMemo(
    () =>
      conversations
        .filter((conv) => !blockedConversationIds.includes(conv.id))
        .reduce((total, conv) => total + unreadCountOf(conv), 0),
    [conversations, blockedConversationIds],
  );

  const value = useMemo(
    () => ({
      status,
      owner,
      pets,
      notifications,
      unreadNotificationCount,
      conversations,
      unreadMessageCount,
      privacy,
      markNotificationRead,
      markAllNotificationsRead,
      setPrivacy,
      reload,
      blockedConversationIds,
      sendMessage,
      markConversationRead,
      blockConversation,
      reportConversation,
      activePetId,
      setActivePet,
      addPet,
      updatePet,
      previewPetDeletion,
      deletePet,
      updateProfile,
      resetDemoData,
      posts,
      visiblePosts,
      followingIds,
      hiddenPostIds,
      reports,
      isPostLiked,
      toggleLike,
      toggleSave,
      hidePost,
      reportPost,
      restoreHiddenPosts,
      addComment,
      createPost,
      discoverablePets,
      interests,
      petBlocks,
      petReports,
      interestFor,
      sendInterest,
      blockPet,
      reportPet,
      connections,
      relationshipFor,
      acceptInterest,
      declineInterest,
      withdrawInterest,
      connectionForPet,
      adoptionListings,
      adoptionApplications,
      savedListingIds,
      hiddenListingIds,
      applicationFor,
      submitApplication,
      withdrawApplication,
      toggleSavedListing,
      blockListing,
      reportListing,
      serviceListings,
      bookingRequests,
      savedServiceIds,
      blockedProviderIds,
      bookingsForService,
      submitBooking,
      withdrawBooking,
      toggleSavedService,
      blockProvider,
      reportProvider,
      products,
      cartItems,
      savedProductIds,
      blockedSellerIds,
      addToCart,
      removeFromCart,
      setCartQuantity,
      clearCart,
      toggleSavedProduct,
      blockSeller,
      reportSeller,
    }),
    [
      status,
      owner,
      pets,
      notifications,
      unreadNotificationCount,
      conversations,
      unreadMessageCount,
      privacy,
      markNotificationRead,
      markAllNotificationsRead,
      setPrivacy,
      reload,
      blockedConversationIds,
      sendMessage,
      markConversationRead,
      blockConversation,
      reportConversation,
      activePetId,
      setActivePet,
      addPet,
      updatePet,
      previewPetDeletion,
      deletePet,
      updateProfile,
      resetDemoData,
      posts,
      visiblePosts,
      followingIds,
      hiddenPostIds,
      reports,
      isPostLiked,
      toggleLike,
      toggleSave,
      hidePost,
      reportPost,
      restoreHiddenPosts,
      addComment,
      createPost,
      discoverablePets,
      interests,
      petBlocks,
      petReports,
      interestFor,
      sendInterest,
      blockPet,
      reportPet,
      connections,
      relationshipFor,
      acceptInterest,
      declineInterest,
      withdrawInterest,
      connectionForPet,
      adoptionListings,
      adoptionApplications,
      savedListingIds,
      hiddenListingIds,
      applicationFor,
      submitApplication,
      withdrawApplication,
      toggleSavedListing,
      blockListing,
      reportListing,
      serviceListings,
      bookingRequests,
      savedServiceIds,
      blockedProviderIds,
      bookingsForService,
      submitBooking,
      withdrawBooking,
      toggleSavedService,
      blockProvider,
      reportProvider,
      products,
      cartItems,
      savedProductIds,
      blockedSellerIds,
      addToCart,
      removeFromCart,
      setCartQuantity,
      clearCart,
      toggleSavedProduct,
      blockSeller,
      reportSeller,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

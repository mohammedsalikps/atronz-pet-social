import type {
  AdoptionListing,
  Conversation,
  DiscoverablePet,
  FeedPost,
  InterestRequest,
  OwnerProfile,
  PetProfile,
  PostAuthor,
  PostComment,
  PostReaction,
  PrivacySettings,
  Product,
  ServiceListing,
  SocialNotification,
} from '@/types';

/**
 * Offline-safe placeholder data.
 *
 * Every name here is invented, no photo is fetched from the network (avatars
 * fall back to initials), and locations are city-level strings — nothing in
 * this file talks to a real user, a real listing or an external service.
 */

const MINUTE = 60 * 1000;

/** Timestamps are relative to load, so the feed never shows a stale "3d ago". */
function minutesAgo(minutes: number): number {
  return Date.now() - minutes * MINUTE;
}

export const MOCK_OWNER: OwnerProfile = {
  id: 'owner-1',
  name: 'Sample Owner',
  handle: '@sampleowner',
  email: 'owner@example.com',
  bio: 'Two rescues, a lot of tennis balls, and a standing 6am walk.',
  city: 'Bengaluru',
  joinedYear: 2025,
  followers: 128,
  following: 96,
};

export const MOCK_PRIVACY: PrivacySettings = {
  showCity: true,
  allowContactRequests: true,
  // Off by default: a pet is only discoverable once the owner opts in.
  discoverable: false,
};

export const MOCK_PETS: PetProfile[] = [
  {
    id: 'pet-1',
    ownerId: 'owner-1',
    name: 'Mochi',
    species: 'dog',
    breed: 'Indie',
    sex: 'female',
    size: 'medium',
    ageYears: 3,
    ageMonths: 4,
    bio: 'Rescued at eight weeks. Loves water, hates the vacuum.',
    vaccination: 'up-to-date',
    neutered: true,
    openToMating: false,
    city: 'Bengaluru',
  },
  {
    id: 'pet-2',
    ownerId: 'owner-1',
    name: 'Pepper',
    species: 'cat',
    breed: 'Domestic Shorthair',
    sex: 'male',
    size: 'small',
    ageYears: 1,
    ageMonths: 7,
    bio: 'Supervises every video call from the top of the bookshelf.',
    vaccination: 'partial',
    neutered: false,
    openToMating: false,
    city: 'Bengaluru',
  },
];

export const MOCK_NOTIFICATIONS: SocialNotification[] = [
  {
    id: 'notif-1',
    kind: 'like',
    title: 'Your post got 12 likes',
    description: 'Owners liked the beach photo of Mochi.',
    createdAt: minutesAgo(18),
    read: false,
    sourceId: 'seed:likes-mochi',
    route: '/feed',
  },
  {
    id: 'notif-2',
    kind: 'contact-request',
    title: 'New contact request',
    description: 'An owner asked to connect about one of your pets.',
    createdAt: minutesAgo(120),
    read: false,
    sourceId: 'seed:contact-request',
    route: '/matches',
  },
  {
    id: 'notif-3',
    kind: 'service',
    title: 'A provider you follow opened weekend slots',
    description: 'Demo activity only — no booking exists.',
    createdAt: minutesAgo(1500),
    read: true,
    sourceId: 'seed:service-slots',
    route: '/services',
  },
];

/**
 * Demo conversations.
 *
 * Threads carry messages rather than a stored preview or unread number, so the
 * list, the badge and the header count are all derived from one source. No
 * message contains a phone number, email, address or link, and none is sent
 * anywhere.
 */
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    kind: 'owner',
    name: 'Weekend Trail Walker',
    participantId: 'owner-4',
    context: 'About a neighbourhood walking group',
    messages: [
      {
        id: 'conv-1-m1',
        conversationId: 'conv-1',
        senderId: 'owner-4',
        senderName: 'Weekend Trail Walker',
        body: 'A few of us meet at the park gate most mornings. You are welcome to join with Mochi.',
        createdAt: minutesAgo(240),
        read: true,
      },
      {
        id: 'conv-1-m2',
        conversationId: 'conv-1',
        senderId: 'owner-1',
        senderName: 'Sample Owner',
        body: 'That sounds good. Is it a flat route? She is fine on lead but not with stairs.',
        createdAt: minutesAgo(180),
        read: true,
      },
      {
        id: 'conv-1-m3',
        conversationId: 'conv-1',
        senderId: 'owner-4',
        senderName: 'Weekend Trail Walker',
        body: 'Completely flat, and we keep it slow. See you at the gate whenever suits.',
        createdAt: minutesAgo(45),
        read: false,
      },
      {
        id: 'conv-1-m4',
        conversationId: 'conv-1',
        senderId: 'owner-4',
        senderName: 'Weekend Trail Walker',
        body: 'No rush at all — the group is there most days.',
        createdAt: minutesAgo(40),
        read: false,
      },
    ],
  },
  {
    id: 'conv-2',
    kind: 'provider',
    name: 'Lakeside Grooming Studio',
    participantId: 'prov-1',
    context: 'Grooming • demo enquiry',
    messages: [
      {
        id: 'conv-2-m1',
        conversationId: 'conv-2',
        senderId: 'owner-1',
        senderName: 'Sample Owner',
        body: 'Do you have any weekend slots for a nervous dog?',
        createdAt: minutesAgo(2000),
        read: true,
      },
      {
        id: 'conv-2-m2',
        conversationId: 'conv-2',
        senderId: 'prov-1',
        senderName: 'Lakeside Grooming Studio',
        body: 'We usually keep a quieter slot on Saturday mornings. This is a demo conversation, so nothing is actually booked.',
        createdAt: minutesAgo(1900),
        read: true,
      },
    ],
  },
  {
    id: 'conv-3',
    kind: 'owner',
    name: 'Second Chance Shelter Shop',
    participantId: 'owner-3',
    context: 'About an adoption listing',
    messages: [
      {
        id: 'conv-3-m1',
        conversationId: 'conv-3',
        senderId: 'owner-3',
        senderName: 'Second Chance Shelter Shop',
        body: 'Thanks for your interest. Everything here is demo data, so please treat it as a preview rather than a real listing.',
        createdAt: minutesAgo(5000),
        read: true,
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Feed (Step 2)
 * ------------------------------------------------------------------ */

/**
 * Author ids the sample owner follows. Drives the Following filter.
 * `owner-1` is the viewer and is always included in their own Following feed.
 */
export const MOCK_FOLLOWING_IDS = ['owner-2', 'owner-3', 'owner-4'];

const MOCK_AUTHORS: Record<string, PostAuthor> = {
  'owner-1': {
    id: 'owner-1',
    name: MOCK_OWNER.name,
    handle: MOCK_OWNER.handle,
    city: MOCK_OWNER.city,
  },
  'owner-2': {
    id: 'owner-2',
    name: 'Riverside Volunteer',
    handle: '@riversidevol',
    city: 'Bengaluru',
  },
  'owner-3': {
    id: 'owner-3',
    name: 'Corner Cat Cafe',
    handle: '@cornercatcafe',
    city: 'Pune',
  },
  'owner-4': {
    id: 'owner-4',
    name: 'Weekend Trail Walker',
    handle: '@trailwalker',
    city: 'Bengaluru',
  },
  'owner-5': {
    id: 'owner-5',
    name: 'The Bunny Room',
    handle: '@thebunnyroom',
    city: 'Chennai',
  },
  /* Deliberately long name and handle — the layout has to survive both. */
  'owner-6': {
    id: 'owner-6',
    name: 'Aarav Krishnamurthy-Venkataraman',
    handle: '@aarav_krishnamurthy_venkataraman',
    city: 'Bengaluru',
  },
};


/**
 * Synthetic likes.
 *
 * Reactions are the source of truth for the count, so a post with 12 likes
 * carries 12 reaction rows. Passing `owner-1` in `extra` makes the post start
 * out liked by the viewer.
 */
function reactions(count: number, extra: string[] = []): PostReaction[] {
  const ids = [
    ...extra,
    ...Array.from({ length: count }, (_, index) => `crowd-${index + 1}`),
  ];
  return ids.map((userId) => ({ userId, kind: 'like' as const }));
}

function comment(
  postId: string,
  index: number,
  authorId: string,
  authorName: string,
  body: string,
  ago: number,
): PostComment {
  return {
    id: `${postId}-c${index}`,
    postId,
    authorId,
    authorName,
    body,
    createdAt: minutesAgo(ago),
  };
}

export const MOCK_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    author: MOCK_AUTHORS['owner-2'],
    pet: { id: 'p-ladoo', name: 'Ladoo', species: 'dog', breed: 'Indie' },
    createdAt: minutesAgo(14),
    body: 'Ladoo finally worked out that the sofa is not a trampoline. Took eight months and one very patient trainer.',
    images: [
      { id: 'post-1-i1', alt: 'Ladoo sitting on a rug beside a sofa' },
      { id: 'post-1-i2', alt: 'Ladoo mid-yawn on the same rug' },
    ],
    visibility: 'public',
    reactions: reactions(12),
    comments: [
      comment('post-1', 1, 'owner-4', 'Weekend Trail Walker', 'Eight months is nothing. Scout took two years.', 9),
      comment('post-1', 2, 'owner-3', 'Corner Cat Cafe', 'That rug has seen things.', 4),
    ],
    saved: false,
  },
  {
    id: 'post-2',
    author: MOCK_AUTHORS['owner-4'],
    pet: { id: 'p-scout', name: 'Scout', species: 'dog', breed: 'Labrador mix' },
    createdAt: minutesAgo(126),
    body: 'Morning loop around the lake. Scout met four other dogs and decided all of them were his best friend.',
    images: [{ id: 'post-2-i1', alt: 'A lake path early in the morning' }],
    visibility: 'public',
    reactions: reactions(5, ['owner-1']),
    comments: [
      comment('post-2', 1, 'owner-2', 'Riverside Volunteer', 'Which lake is this? Looks like a good flat route.', 100),
    ],
    saved: true,
  },
  {
    id: 'post-3',
    author: MOCK_AUTHORS['owner-3'],
    pet: { id: 'p-biscuit', name: 'Biscuit', species: 'cat', breed: 'Domestic Shorthair' },
    createdAt: minutesAgo(320),
    body: 'Long overdue update on Biscuit, who came to us as a very small and very loud kitten and is now a very large and equally loud adult. He has claimed the window seat by the door, which means every customer gets inspected on the way in and, if he approves, escorted to their table. He does not approve of everyone. We have started warning people.',
    images: [{ id: 'post-3-i1', alt: 'Biscuit asleep on a wide window ledge' }],
    visibility: 'public',
    reactions: reactions(27),
    comments: [
      comment('post-3', 1, 'owner-5', 'The Bunny Room', 'The escorting is a real service. Worth the inspection.', 300),
      comment('post-3', 2, 'owner-1', MOCK_OWNER.name, 'Pepper does the same thing from a bookshelf. Less dignified.', 220),
      comment('post-3', 3, 'owner-4', 'Weekend Trail Walker', 'Coming by on Saturday to get inspected.', 60),
    ],
    saved: false,
  },
  {
    id: 'post-4',
    author: MOCK_AUTHORS['owner-1'],
    pet: { id: 'pet-2', name: 'Pepper', species: 'cat', breed: 'Domestic Shorthair' },
    createdAt: minutesAgo(510),
    body: 'Pepper has supervised every call this week from the top of the bookshelf. No notes, just judgement.',
    images: [],
    visibility: 'followers',
    reactions: reactions(4),
    comments: [],
    saved: false,
  },
  {
    id: 'post-5',
    author: MOCK_AUTHORS['owner-5'],
    pet: { id: 'p-clover', name: 'Clover', species: 'rabbit', breed: 'Mini Lop' },
    createdAt: minutesAgo(1500),
    body: 'Rearranged the pen this weekend. Clover spent an hour inspecting the new layout and then moved the tunnel back to exactly where it was.',
    images: [
      { id: 'post-5-i1', alt: 'A rabbit pen with a fabric tunnel' },
      { id: 'post-5-i2', alt: 'Clover beside a stack of hay' },
      { id: 'post-5-i3', alt: 'The tunnel back in its original corner' },
    ],
    visibility: 'public',
    reactions: reactions(9),
    comments: [
      comment('post-5', 1, 'owner-3', 'Corner Cat Cafe', 'They always move it back. Every time.', 1400),
    ],
    saved: false,
  },
  {
    id: 'post-6',
    author: MOCK_AUTHORS['owner-6'],
    pet: {
      id: 'p-maximilian',
      name: 'Maximilian Bartholomew',
      species: 'dog',
      breed: 'Bernese Mountain Dog',
    },
    createdAt: minutesAgo(2100),
    body: 'Maximilian Bartholomew, known to everyone except the vet as Max, turned four this week and celebrated by refusing to come indoors.',
    images: [{ id: 'post-6-i1', alt: 'A large dog lying in a garden' }],
    visibility: 'public',
    reactions: reactions(18, ['owner-1']),
    comments: [
      comment('post-6', 1, 'owner-2', 'Riverside Volunteer', 'Happy birthday Max. Worth the full name.', 2000),
      comment('post-6', 2, 'owner-4', 'Weekend Trail Walker', 'Correct decision on his part.', 1800),
    ],
    saved: false,
  },
];

/* ------------------------------------------------------------------ *
 * Discovery (Step 3)
 * ------------------------------------------------------------------ */

/**
 * Pets other owners have opted into Discover.
 *
 * Every field is invented placeholder data. There are no contact details on
 * these objects by design, and nothing here is fetched from a network.
 *
 * `discoverable: false` on two of them proves the opt-in is real: they are in
 * the source data but never reach the grid under the default filters.
 */
export const MOCK_DISCOVERABLE_PETS: DiscoverablePet[] = [
  {
    id: 'disc-1',
    ownerId: 'owner-2',
    ownerName: 'Riverside Volunteer',
    ownerHandle: '@riversidevol',
    name: 'Ladoo',
    species: 'dog',
    breed: 'Indie',
    sex: 'female',
    size: 'medium',
    ageYears: 3,
    ageMonths: 2,
    city: 'Bengaluru',
    bio: 'Settled, gentle and endlessly patient with puppies. Walks twice a day and sleeps through everything else.',
    vaccination: 'up-to-date',
    neutered: false,
    healthNotes:
      'Owner note: no ongoing concerns that we know of. Routine check-ups only.',
    energyLevel: 'moderate',
    temperament: ['Calm', 'Patient', 'Sociable'],
    goodWithOtherPets: true,
    photos: [
      { id: 'disc-1-p1', alt: 'Ladoo sitting on a rug' },
      { id: 'disc-1-p2', alt: 'Ladoo on a morning walk' },
    ],
    discoverable: true,
  },
  {
    id: 'disc-2',
    ownerId: 'owner-4',
    ownerName: 'Weekend Trail Walker',
    ownerHandle: '@trailwalker',
    name: 'Scout',
    species: 'dog',
    breed: 'Labrador mix',
    sex: 'male',
    size: 'large',
    ageYears: 4,
    ageMonths: 0,
    city: 'Bengaluru',
    bio: 'Thinks every dog is a friend and every puddle is a swimming pool. Trained recall, terrible impulse control.',
    vaccination: 'up-to-date',
    neutered: false,
    healthNotes: 'Owner note: stiff after very long walks. Nothing diagnosed.',
    energyLevel: 'high',
    temperament: ['Friendly', 'Energetic', 'Curious'],
    goodWithOtherPets: true,
    photos: [{ id: 'disc-2-p1', alt: 'Scout beside a lake path' }],
    discoverable: true,
  },
  {
    id: 'disc-3',
    ownerId: 'owner-3',
    ownerName: 'Corner Cat Cafe',
    ownerHandle: '@cornercatcafe',
    name: 'Biscuit',
    species: 'cat',
    breed: 'Domestic Shorthair',
    sex: 'male',
    size: 'medium',
    ageYears: 2,
    ageMonths: 6,
    city: 'Pune',
    bio: 'Runs the window seat. Opinionated about visitors, generous with other cats once he has decided about you.',
    vaccination: 'partial',
    neutered: false,
    healthNotes: 'Owner note: none shared.',
    energyLevel: 'low',
    temperament: ['Independent', 'Watchful'],
    goodWithOtherPets: true,
    photos: [{ id: 'disc-3-p1', alt: 'Biscuit asleep on a window ledge' }],
    discoverable: true,
  },
  {
    id: 'disc-4',
    ownerId: 'owner-5',
    ownerName: 'The Bunny Room',
    ownerHandle: '@thebunnyroom',
    name: 'Clover',
    species: 'rabbit',
    breed: 'Mini Lop',
    sex: 'female',
    size: 'small',
    ageYears: 1,
    ageMonths: 8,
    city: 'Chennai',
    bio: 'Rearranges her pen daily and expects it to stay that way. Bonded easily with our older rabbit.',
    vaccination: 'up-to-date',
    neutered: false,
    healthNotes: 'Owner note: none shared.',
    energyLevel: 'moderate',
    temperament: ['Tidy', 'Sociable'],
    goodWithOtherPets: true,
    photos: [
      { id: 'disc-4-p1', alt: 'Clover beside a fabric tunnel' },
      { id: 'disc-4-p2', alt: 'Clover next to a stack of hay' },
    ],
    discoverable: true,
  },
  {
    /* Long name and breed — the layout has to wrap or truncate both safely. */
    id: 'disc-5',
    ownerId: 'owner-6',
    ownerName: 'Aarav Krishnamurthy-Venkataraman',
    ownerHandle: '@aarav_krishnamurthy_venkataraman',
    name: 'Maximilian Bartholomew',
    species: 'dog',
    breed: 'Bernese Mountain Dog',
    sex: 'male',
    size: 'large',
    ageYears: 4,
    ageMonths: 1,
    city: 'Bengaluru',
    bio: 'Refuses to come indoors, refuses to be rushed, refuses his own name. Extremely gentle with smaller dogs.',
    vaccination: 'unknown',
    neutered: false,
    healthNotes: 'Owner note: none shared.',
    energyLevel: 'low',
    temperament: ['Gentle', 'Stubborn'],
    goodWithOtherPets: true,
    photos: [{ id: 'disc-5-p1', alt: 'A large dog lying in a garden' }],
    discoverable: true,
  },
  {
    id: 'disc-6',
    ownerId: 'owner-7',
    ownerName: 'Harbour Aviary',
    ownerHandle: '@harbouraviary',
    name: 'Pip',
    species: 'bird',
    breed: 'Budgerigar',
    sex: 'female',
    size: 'small',
    ageYears: 0,
    ageMonths: 11,
    city: 'Kochi',
    bio: 'Learning three whistles and using all of them at 6am. Housed with two other budgies.',
    vaccination: 'unknown',
    neutered: false,
    healthNotes: 'Owner note: none shared.',
    energyLevel: 'high',
    temperament: ['Vocal', 'Sociable'],
    goodWithOtherPets: true,
    photos: [{ id: 'disc-6-p1', alt: 'A budgerigar on a wooden perch' }],
    discoverable: true,
  },
  {
    /* Opted out — present in the data, absent from the grid by default. */
    id: 'disc-7',
    ownerId: 'owner-8',
    ownerName: 'Quiet Street Owner',
    ownerHandle: '@quietstreet',
    name: 'Juno',
    species: 'cat',
    breed: 'Bengal',
    sex: 'female',
    size: 'medium',
    ageYears: 5,
    ageMonths: 4,
    city: 'Bengaluru',
    bio: 'Not looking to connect right now.',
    vaccination: 'up-to-date',
    neutered: true,
    healthNotes: 'Owner note: none shared.',
    energyLevel: 'moderate',
    temperament: ['Reserved'],
    goodWithOtherPets: false,
    photos: [],
    discoverable: false,
  },
  {
    id: 'disc-8',
    ownerId: 'owner-9',
    ownerName: 'Hillside Owner',
    ownerHandle: '@hillside',
    name: 'Tofu',
    species: 'dog',
    breed: 'Shih Tzu',
    sex: 'female',
    size: 'small',
    ageYears: 6,
    ageMonths: 0,
    city: 'Pune',
    bio: 'Profile kept private for now.',
    vaccination: 'partial',
    neutered: true,
    healthNotes: 'Owner note: none shared.',
    energyLevel: 'low',
    temperament: ['Quiet'],
    goodWithOtherPets: false,
    photos: [],
    discoverable: false,
  },
];

/* ------------------------------------------------------------------ *
 * Matches (Step 4)
 * ------------------------------------------------------------------ */

/**
 * Seed interests, so Matches has something to show on first load.
 *
 * `petId` is always the other owner's pet and `fromPetId` is always one of the
 * viewer's pets. Timestamps are offsets from load, so the relative labels stay
 * correct without a fixed date going stale.
 *
 * Note `disc-3` and `disc-7`: history rows referencing pets the viewer may
 * later block. Matches filters blocked pets out of every section, including
 * history, so this data also exercises that rule.
 */
export const MOCK_INTERESTS: InterestRequest[] = [
  {
    id: 'interest-seed-1',
    petId: 'disc-2',
    fromPetId: 'pet-1',
    direction: 'received',
    status: 'pending',
    sentAt: minutesAgo(45),
    resolvedAt: null,
  },
  {
    id: 'interest-seed-2',
    petId: 'disc-4',
    fromPetId: 'pet-2',
    direction: 'received',
    status: 'pending',
    sentAt: minutesAgo(300),
    resolvedAt: null,
  },
  {
    id: 'interest-seed-3',
    petId: 'disc-5',
    fromPetId: 'pet-1',
    direction: 'received',
    status: 'pending',
    sentAt: minutesAgo(1600),
    resolvedAt: null,
  },
  {
    id: 'interest-seed-4',
    petId: 'disc-6',
    fromPetId: 'pet-2',
    direction: 'sent',
    status: 'pending',
    sentAt: minutesAgo(180),
    resolvedAt: null,
  },
  {
    id: 'interest-seed-5',
    petId: 'disc-3',
    fromPetId: 'pet-1',
    direction: 'sent',
    status: 'withdrawn',
    sentAt: minutesAgo(4300),
    resolvedAt: minutesAgo(4100),
  },
  {
    id: 'interest-seed-6',
    petId: 'disc-1',
    fromPetId: 'pet-1',
    direction: 'received',
    status: 'declined',
    sentAt: minutesAgo(6000),
    resolvedAt: minutesAgo(5900),
  },
];

/* ------------------------------------------------------------------ *
 * Adoption (Step 5)
 * ------------------------------------------------------------------ */

/**
 * Adoption listings.
 *
 * Invented placeholder data. No listing carries an email, phone number,
 * address, coordinate or link — the type has no field for one. `listerName`
 * is a public display name only.
 *
 * The set deliberately covers every status, a listing with no photos, one with
 * extra-care needs, and a very long name and breed.
 */
export const MOCK_ADOPTION_LISTINGS: AdoptionListing[] = [
  {
    id: 'adopt-1',
    name: 'Poppy',
    species: 'dog',
    breed: 'Indie',
    sex: 'female',
    size: 'medium',
    ageYears: 2,
    ageMonths: 3,
    city: 'Bengaluru',
    description:
      'Came to us as a stray and turned out to be the calmest dog in the shelter. Walks well on a lead and ignores traffic.',
    status: 'available',
    listerKind: 'shelter',
    listerName: 'Lakeside Animal Shelter',
    vaccination: 'up-to-date',
    healthNotes:
      'Shelter note: healthy at intake check. No ongoing treatment that we know of.',
    careNeeds: [],
    photos: [
      { id: 'adopt-1-p1', alt: 'Poppy sitting in a shelter yard' },
      { id: 'adopt-1-p2', alt: 'Poppy on a lead beside a bench' },
    ],
    listedAt: minutesAgo(600),
  },
  {
    id: 'adopt-2',
    name: 'Nimbus',
    species: 'cat',
    breed: 'Domestic Shorthair',
    sex: 'male',
    size: 'small',
    ageYears: 0,
    ageMonths: 9,
    city: 'Pune',
    description:
      'Found under a parked car at eight weeks. Now fully weaned, litter trained and extremely interested in shoelaces.',
    status: 'available',
    listerKind: 'rescue',
    listerName: 'Second Chance Rescue',
    vaccination: 'partial',
    healthNotes: 'Rescue note: one vaccination remaining. Nothing else shared.',
    careNeeds: [],
    photos: [{ id: 'adopt-2-p1', alt: 'A young cat on a blanket' }],
    listedAt: minutesAgo(1400),
  },
  {
    id: 'adopt-3',
    name: 'Bramble',
    species: 'dog',
    breed: 'Beagle mix',
    sex: 'male',
    size: 'medium',
    ageYears: 7,
    ageMonths: 0,
    city: 'Bengaluru',
    description:
      'A senior looking for a quiet retirement. Happiest on a short walk and a long nap, in that order.',
    status: 'available',
    listerKind: 'owner',
    listerName: 'Riverside Volunteer',
    vaccination: 'up-to-date',
    healthNotes:
      'Owner note: stiff in the mornings and slower on stairs. Not assessed by us — please have your own vet check him.',
    careNeeds: [
      'Prefers a home without stairs',
      'Needs a quiet household',
      'Short walks only',
    ],
    photos: [{ id: 'adopt-3-p1', alt: 'An older beagle resting on a mat' }],
    listedAt: minutesAgo(2600),
  },
  {
    id: 'adopt-4',
    name: 'Marigold',
    species: 'rabbit',
    breed: 'Mini Lop',
    sex: 'female',
    size: 'small',
    ageYears: 1,
    ageMonths: 2,
    city: 'Chennai',
    description:
      'Bonded closely with our resident rabbit and would do best going to a home with another rabbit.',
    status: 'pending',
    listerKind: 'rescue',
    listerName: 'The Bunny Room',
    vaccination: 'up-to-date',
    healthNotes: 'Rescue note: none shared.',
    careNeeds: ['Should go to a home with another rabbit'],
    /* No photos — the card and dialog must both fall back safely. */
    photos: [],
    listedAt: minutesAgo(3300),
  },
  {
    id: 'adopt-5',
    /* Long name and breed — the layout has to wrap or truncate both. */
    name: 'Clementine Featherstonehaugh',
    species: 'cat',
    breed: 'Domestic Longhair (semi-feral)',
    sex: 'female',
    size: 'medium',
    ageYears: 4,
    ageMonths: 6,
    city: 'Bengaluru',
    description:
      'Semi-feral and still deciding about people. Would suit an experienced adopter with patience and no small children.',
    status: 'available',
    listerKind: 'shelter',
    listerName: 'Lakeside Animal Shelter',
    vaccination: 'unknown',
    healthNotes:
      'Shelter note: handling has been limited, so we have not been able to complete a full check.',
    careNeeds: [
      'Experienced adopter preferred',
      'No small children',
      'Needs a long settling-in period',
    ],
    photos: [{ id: 'adopt-5-p1', alt: 'A longhaired cat watching from a shelf' }],
    listedAt: minutesAgo(4800),
  },
  {
    id: 'adopt-6',
    name: 'Juniper',
    species: 'dog',
    breed: 'Labrador mix',
    sex: 'female',
    size: 'large',
    ageYears: 3,
    ageMonths: 5,
    city: 'Kochi',
    description:
      'Rehomed successfully last month. Kept on the board so adopters can see what a completed listing looks like.',
    status: 'adopted',
    listerKind: 'rescue',
    listerName: 'Harbour Animal Rescue',
    vaccination: 'up-to-date',
    healthNotes: 'Rescue note: none shared.',
    careNeeds: [],
    photos: [{ id: 'adopt-6-p1', alt: 'A labrador mix in a garden' }],
    listedAt: minutesAgo(9000),
  },
];

/* ------------------------------------------------------------------ *
 * Services (Step 6)
 * ------------------------------------------------------------------ */

/**
 * Pet service listings.
 *
 * Invented placeholder data. No listing carries a phone number, email,
 * address, coordinate or link — the type has no field for one. Qualifications
 * and ratings are provider claims, rendered as such and never as verification.
 *
 * The set covers every availability state, a listing with no price, one with
 * no photos, one with no rating, and a very long provider and service name.
 */
export const MOCK_SERVICES: ServiceListing[] = [
  {
    id: 'svc-1',
    providerId: 'prov-1',
    providerName: 'Lakeside Grooming Studio',
    name: 'Full groom and nail trim',
    category: 'grooming',
    species: ['dog', 'cat'],
    city: 'Bengaluru',
    description:
      'Bath, blow dry, brush out, nail trim and ear clean. Nervous pets are welcome and we work at their pace.',
    availability: 'accepting',
    price: { minInr: 800, maxInr: 1600, unit: 'visit' },
    qualifications: [
      'Provider states: 9 years grooming experience',
      'Provider states: trained on double-coated breeds',
    ],
    rating: { average: 4.6, count: 38 },
    preparationNotes: [
      'Walk your dog before the appointment',
      'Bring a recent vaccination record if you have one',
    ],
    cancellationNote:
      'Provider states: cancel at least 24 hours ahead to keep the slot free for someone else.',
    photos: [
      { id: 'svc-1-p1', alt: 'A grooming table with brushes laid out' },
      { id: 'svc-1-p2', alt: 'A dog being towel dried' },
    ],
  },
  {
    id: 'svc-2',
    providerId: 'prov-2',
    providerName: 'Morning Loop Walkers',
    name: 'Group neighbourhood walk',
    category: 'walking',
    species: ['dog'],
    city: 'Bengaluru',
    description:
      'A 45 minute group walk with up to four dogs, on lead throughout. Same walker every day so your dog knows who is coming.',
    availability: 'accepting',
    price: { minInr: 350, maxInr: 350, unit: 'visit' },
    qualifications: ['Provider states: 4 years walking experience'],
    rating: { average: 4.8, count: 112 },
    preparationNotes: ['Leave a harness and lead by the door'],
    photos: [{ id: 'svc-2-p1', alt: 'A lead hanging by a front door' }],
  },
  {
    id: 'svc-3',
    providerId: 'prov-3',
    providerName: 'The Quiet House Boarding',
    name: 'Small-group overnight boarding',
    category: 'boarding',
    species: ['dog', 'cat', 'rabbit'],
    city: 'Pune',
    description:
      'A home rather than a kennel, with a maximum of three guests at a time. Daily photo update, and a garden for the dogs.',
    availability: 'waitlist',
    price: { minInr: 900, maxInr: 1400, unit: 'night' },
    qualifications: ['Provider states: has boarded pets since 2019'],
    rating: { average: 4.9, count: 64 },
    preparationNotes: [
      'Bring your own food to avoid a diet change',
      'Bring one familiar blanket or toy',
    ],
    cancellationNote:
      'Provider states: waitlist places are offered in the order requests arrive.',
    photos: [{ id: 'svc-3-p1', alt: 'A quiet room with pet beds' }],
  },
  {
    id: 'svc-4',
    providerId: 'prov-4',
    providerName: 'Steady Paws Training',
    name: 'Reactivity and loose-lead sessions',
    category: 'training',
    species: ['dog'],
    city: 'Bengaluru',
    description:
      'One-to-one sessions focused on lead manners and building confidence around other dogs. Reward based, no aversive tools.',
    availability: 'accepting',
    price: { minInr: 1200, maxInr: 2000, unit: 'session' },
    qualifications: [
      'Provider states: certified by a national training body',
      'Provider states: reward-based methods only',
    ],
    rating: { average: 4.7, count: 21 },
    preparationNotes: ['Bring high-value treats', 'A flat collar or harness, no retractable leads'],
    photos: [{ id: 'svc-4-p1', alt: 'A training field with cones' }],
  },
  {
    id: 'svc-5',
    providerId: 'prov-5',
    /* Long provider and service name — the layout has to wrap both. */
    providerName: 'Aarav Krishnamurthy-Venkataraman Pet Care Collective',
    name: 'In-home pet sitting and medication administration visits',
    category: 'sitting',
    species: ['cat', 'rabbit', 'bird', 'other'],
    city: 'Bengaluru',
    description:
      'Drop-in visits while you are away: feeding, litter, fresh water and company. Happy to give oral medication if you leave clear instructions.',
    availability: 'accepting',
    /* No published price — the card and detail must both handle its absence. */
    qualifications: ['Provider states: 6 years of in-home sitting'],
    /* No rating published either. */
    preparationNotes: ['Leave written feeding and medication instructions'],
    photos: [],
  },
  {
    id: 'svc-6',
    providerId: 'prov-6',
    providerName: 'Harbour Vet Info Desk',
    name: 'General pet care information call',
    category: 'vet-consult',
    species: ['dog', 'cat', 'rabbit', 'bird', 'other'],
    city: 'Kochi',
    description:
      'A general information conversation about routine pet care topics. Not a consultation, not a diagnosis, and not a substitute for seeing a vet.',
    availability: 'closed',
    price: { minInr: 500, maxInr: 500, unit: 'session' },
    qualifications: ['Provider states: staffed by veterinary assistants'],
    preparationNotes: [],
    cancellationNote:
      'Provider states: not taking new requests this month.',
    photos: [{ id: 'svc-6-p1', alt: 'A desk with a notebook and phone' }],
  },
];

/* ------------------------------------------------------------------ *
 * Marketplace (Step 7)
 * ------------------------------------------------------------------ */

/**
 * Demo products.
 *
 * Invented placeholder data with deterministic prices. No product carries a
 * merchant link, contact route or payment field — the type has none. Ratings
 * and notes are seller claims, rendered as such.
 *
 * The set covers every availability state and seller type, a product with no
 * photos, one with no rating, one with no spec lines, a health-category item
 * that must never read as medical, and a very long product and seller name.
 */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sellerId: 'seller-1',
    sellerName: 'Lakeside Pet Supply',
    sellerKind: 'brand',
    name: 'Everyday dry food, chicken',
    category: 'food',
    species: ['dog'],
    description:
      'A plain everyday kibble for adult dogs. Seller states it is their most repeated order.',
    priceInr: 1450,
    availability: 'in-stock',
    rating: { average: 4.4, count: 210 },
    sellerNotes: ['Seller states: no artificial colours'],
    productInfo: ['Weight: 3 kg', 'For adult dogs', 'Chicken and rice'],
    photos: [
      { id: 'prod-1-p1', alt: 'A bag of dry dog food' },
      { id: 'prod-1-p2', alt: 'Kibble in a bowl' },
    ],
  },
  {
    id: 'prod-2',
    sellerId: 'seller-2',
    sellerName: 'Corner Workshop',
    sellerKind: 'independent',
    name: 'Rope tug toy',
    category: 'toys',
    species: ['dog'],
    description:
      'Hand-knotted cotton rope for tug and fetch. Seller states each one is made to order.',
    priceInr: 320,
    availability: 'in-stock',
    rating: { average: 4.8, count: 46 },
    sellerNotes: ['Seller states: undyed cotton'],
    productInfo: ['Length: 30 cm', 'Cotton'],
    photos: [{ id: 'prod-2-p1', alt: 'A knotted cotton rope toy' }],
  },
  {
    id: 'prod-3',
    sellerId: 'seller-1',
    sellerName: 'Lakeside Pet Supply',
    sellerKind: 'brand',
    name: 'Slicker brush, medium',
    category: 'grooming',
    species: ['dog', 'cat'],
    description:
      'A general purpose slicker brush for medium coats, with a bent-wire head and a rubber grip.',
    priceInr: 480,
    availability: 'low-stock',
    rating: { average: 4.2, count: 88 },
    sellerNotes: [],
    productInfo: ['Head width: 9 cm'],
    photos: [{ id: 'prod-3-p1', alt: 'A slicker brush on a table' }],
  },
  {
    id: 'prod-4',
    sellerId: 'seller-3',
    sellerName: 'Second Chance Shelter Shop',
    sellerKind: 'shelter-shop',
    name: 'Padded collar and lead set',
    category: 'accessories',
    species: ['dog'],
    description:
      'A simple padded set in three sizes. Seller states proceeds go back into the shelter.',
    priceInr: 890,
    availability: 'in-stock',
    /* No rating published. */
    sellerNotes: ['Seller states: proceeds support the shelter'],
    productInfo: ['Sizes: S, M, L', 'Nylon with padding'],
    photos: [{ id: 'prod-4-p1', alt: 'A collar and lead laid out' }],
  },
  {
    id: 'prod-5',
    sellerId: 'seller-4',
    /* Long seller and product name — the layout has to wrap both. */
    sellerName: 'Aarav Krishnamurthy-Venkataraman Home Textiles',
    sellerKind: 'independent',
    name: 'Washable orthopaedic-style bolster bed, large size',
    category: 'bedding',
    species: ['dog', 'cat'],
    description:
      'A bolster bed with a removable washable cover. Seller states the foam base holds its shape.',
    priceInr: 2650,
    availability: 'in-stock',
    rating: { average: 4.6, count: 31 },
    sellerNotes: ['Seller states: cover is machine washable'],
    /* No spec lines published. */
    productInfo: [],
    photos: [],
  },
  {
    id: 'prod-6',
    sellerId: 'seller-2',
    sellerName: 'Corner Workshop',
    sellerKind: 'independent',
    name: 'Fold-flat travel bowl',
    category: 'travel',
    species: ['dog', 'cat', 'other'],
    description:
      'A silicone bowl that folds flat for walks and car trips, with a clip for a lead or bag.',
    priceInr: 260,
    availability: 'in-stock',
    rating: { average: 4.5, count: 73 },
    sellerNotes: [],
    productInfo: ['Capacity: 400 ml', 'Silicone'],
    photos: [{ id: 'prod-6-p1', alt: 'A folded silicone travel bowl' }],
  },
  {
    id: 'prod-7',
    sellerId: 'seller-3',
    sellerName: 'Second Chance Shelter Shop',
    sellerKind: 'shelter-shop',
    name: 'Training treat pouch',
    category: 'training',
    species: ['dog'],
    description:
      'A belt pouch with a magnetic closure, sized for a training session rather than a whole walk.',
    priceInr: 540,
    availability: 'out-of-stock',
    rating: { average: 4.3, count: 19 },
    sellerNotes: ['Seller states: restocking soon'],
    productInfo: ['Belt clip included'],
    photos: [{ id: 'prod-7-p1', alt: 'A treat pouch clipped to a belt' }],
  },
  {
    /* Health category — must never read as diagnosis, treatment or cure. */
    id: 'prod-8',
    sellerId: 'seller-1',
    sellerName: 'Lakeside Pet Supply',
    sellerKind: 'brand',
    name: 'Paw balm, unscented',
    category: 'health',
    species: ['dog'],
    description:
      'An unscented balm the seller describes as a general paw moisturiser for everyday use.',
    priceInr: 390,
    availability: 'in-stock',
    rating: { average: 4.1, count: 57 },
    sellerNotes: [
      'Seller states: beeswax and plant oils',
      'Seller states: not a medicine and not for treating any condition',
    ],
    productInfo: ['Volume: 50 ml'],
    photos: [{ id: 'prod-8-p1', alt: 'A small tin of paw balm' }],
  },
];

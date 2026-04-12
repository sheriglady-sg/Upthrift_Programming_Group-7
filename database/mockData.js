const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Other users
const otherUsers = [
  {
    id: 1, slug: 'sarah-j', name: 'Sarah J.', fullName: 'Sarah Johnson',
    username: '@sarahj', initials: 'SJ',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',    
    bio: 'Vintage lover 🌸 | Thrift store enthusiast | Sharing my sustainable fashion journey',
    posts: 89, followers: 542, following: 231,
    postImages: [
      { id: 1, label: 'Post Image 1', image: '/images/post1.jpg' },
      { id: 2, label: 'Post Image 2', image: '/images/post2.jpg' },
      { id: 3, label: 'Post Image 3', image: '/images/post3.jpg' },
      { id: 4, label: 'Post Image 4', image: '/images/post4.jpg' },
      { id: 5, label: 'Post Image 5', image: '/images/post5.jpg' },
      { id: 6, label: 'Post Image 6', image: '/images/post6.jpg' },
    ],
    about: 'Based in Dublin, IE. Passionate about sustainable thrift shopping and upcycling.',
    convoId: 1,
  },
  {
    id: 2, slug: 'mike-c', name: 'Mike C.', fullName: 'Mike Chen',
    username: '@mikechen', initials: 'MC',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',     
    bio: 'Upcycling wizard 🔧 | Turning old jeans into art | Dublin thrift community',
    posts: 54, followers: 310, following: 180,
    postImages: [
      { id: 1, label: 'Post Image 1', image: '/images/post1.jpg' },
      { id: 2, label: 'Post Image 2', image: '/images/post2.jpg' },
      { id: 3, label: 'Post Image 3', image: '/images/post3.jpg' },
      { id: 4, label: 'Post Image 4', image: '/images/post4.jpg' },
    ],
    about: 'Based in Dublin, IE. DIY upcycler and thrift market regular.',
    convoId: 2,
  },
  {
    id: 3, slug: 'emma-d', name: 'Emma D.', fullName: 'Emma Davis',
    username: '@emmad', initials: 'ED',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',  
    bio: 'Thrift queen 👑 | Haul curator | Sustainable style advocate',
    posts: 73, followers: 421, following: 200,
    postImages: [
      { id: 1, label: 'Post Image 1', image: '/images/post1.jpg' },
      { id: 2, label: 'Post Image 2', image: '/images/post2.jpg' },
      { id: 3, label: 'Post Image 3', image: '/images/post3.jpg' },
    ],
    about: 'Based in Dublin, IE. Lover of all things vintage and second-hand.',
    convoId: 3,
  },
];

const posts = [
  {
    id: 1, author: 'Sarah J.', authorSlug: 'sarah-j',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    timeAgo: '2 hours ago', fullDate: 'March 7, 2026 at 2:30 PM',
    content: 'Check out this vintage jacket I found at the downtown thrift store!',
    image: '/images/jacket.jpg',
    likes: 24, comments: 5,
commentList: [
  {
    author: 'Mike C.',
    authorSlug: 'mike-c',  
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    text: 'Love the color! Where was this?',
    timeAgo: '1 hour ago'
  },
  {
    author: 'Emma D.',
    authorSlug: 'emma-d', 
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    text: 'Amazing find! 🔥',
    timeAgo: '30 minutes ago'
  },
],
  },
  {
    id: 2, author: 'Mike C.', authorSlug: 'mike-c',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    timeAgo: '2 hours ago', content: 'Upcycled these old jeans into a tote bag',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800',
    likes: 24, comments: 5, commentList: [],
  },
  {
    id: 3, author: 'Emma D.', authorSlug: 'emma-d',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    timeAgo: '2 hours ago', content: 'Amazing thrift haul from downtown!',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    likes: 24, comments: 5, commentList: [],
  },
];

const myProfile = {
  name: 'Sarah Martinez', username: '@sarahm_thrift', initials: 'SM',
  bio: 'Vintage clothing enthusiast 🌿 Sustainable fashion advocate | Sharing my thrift finds and upcycling projects',
  posts: 127, followers: '1.2k', following: 345,
  myPosts: [
    { id: 1, label: 'Post 1', image: '/images/post1.jpg' },
    { id: 2, label: 'Post 2', image: '/images/post2.jpg' },
    { id: 3, label: 'Post 3', image: '/images/post3.jpg' },
    { id: 4, label: 'Post 4', image: '/images/post4.jpg' },
    { id: 5, label: 'Post 5', image: '/images/post5.jpg' },
    { id: 6, label: 'Post 6', image: '/images/post6.jpg' },
  ],
  savedPosts: [
    { id: 1, label: 'Saved 1', image: '/images/saved1.jpg' },
    { id: 2, label: 'Saved 2', image: '/images/saved2.jpg' },
    { id: 3, label: 'Saved 3', image: '/images/saved3.jpg' },
    { id: 4, label: 'Saved 4', image: '/images/saved4.jpg' },
  ],
};

const conversations = [
  {
    id: 1, name: 'Sarah Johnson', userSlug: 'sarah-j', initials: 'SJ',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    lastMessage: 'That vintage jacket is amazing! Is it still available?', timeAgo: '2m ago',
    messages: [
      { from: 'them', text: 'Hi! I saw your post about the vintage denim jacket. Is it still available?', time: '10:30 AM' },
      { from: 'me',   text: 'Yes, it is! Are you interested?', time: '10:32 AM' },
      { from: 'them', text: 'Definitely! Can you tell me more about the condition and size?', time: '10:33 AM' },
      { from: 'me',   text: "It's in great condition, barely any signs of wear. It's a medium, but fits like a modern size small. The denim is really thick and high quality.", time: '10:35 AM' },
      { from: 'them', text: 'That vintage jacket is amazing! Is it still available?', time: '10:37 AM' },
      { from: 'me',   text: "Yes! I can meet up this weekend if you'd like to see it in person.", time: '10:38 AM' },
    ],
  },
  { id: 2, name: 'Mike Chen', userSlug: 'mike-c', initials: 'MC', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', lastMessage: 'Thanks for the upcycling tips! Really helpful.', timeAgo: '1h ago', messages: [{ from: 'them', text: 'Thanks for the upcycling tips! Really helpful.', time: '9:15 AM' }, { from: 'me', text: 'Glad it helped! Let me know if you have questions.', time: '9:20 AM' }] },
  { id: 3, name: 'Emma Davis', userSlug: 'emma-d', initials: 'ED', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', lastMessage: 'See you at the thrift market this Saturday!', timeAgo: '3h ago', messages: [{ from: 'me', text: 'Are you going to the thrift market this Saturday?', time: '8:00 AM' }, { from: 'them', text: 'See you at the thrift market this Saturday!', time: '8:05 AM' }] },
  { id: 4, name: 'Alex Kim', userSlug: null, initials: 'AK', avatar:'/images/Mike.jpg', lastMessage: 'Do you have more details about that thrift store?', timeAgo: 'Yesterday', messages: [{ from: 'them', text: 'Do you have more details about that thrift store?', time: 'Yesterday' }] },
  { id: 5, name: 'Jessica Brown', userSlug: null, initials: 'JB', avatar: '/images/Emma.jpg', lastMessage: 'Love your recent post about sustainable fashion!', timeAgo: '2 days ago', messages: [{ from: 'them', text: 'Love your recent post about sustainable fashion!', time: '2 days ago' }] },
  { id: 6, name: 'David Martinez', userSlug: null, initials: 'DM', avatar:'/images/Sarah.jpg', lastMessage: 'Can you share the location of that vintage shop?', timeAgo: '3 days ago', messages: [{ from: 'them', text: 'Can you share the location of that vintage shop?', time: '3 days ago' }] },
];

const suggestedUsers = [
  { id: 1, name: 'Sarah Johnson', username: '@sarahj',   initials: 'SJ', status: 'Active community member' },
  { id: 2, name: 'Mike Chen',     username: '@mikechen', initials: 'MC', status: 'Active community member' },
  { id: 3, name: 'Emma Davis',    username: '@emmad',    initials: 'ED', status: 'Active community member' },
  { id: 4, name: 'Alex Kim',      username: '@alexk',    initials: 'AK', status: 'Active community member' },
  { id: 5, name: 'Jessica Brown', username: '@jessicab', initials: 'JB', status: 'Active community member' },
];

// ─── Routes ───────────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/feed'));

app.get('/feed', (req, res) => res.render('feed', { posts, activePage: 'feed' }));

app.get('/post/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) return res.redirect('/feed');
  res.render('post-details', { post, activePage: 'feed' });
});

app.get('/create-post', (req, res) => res.render('create-post', { activePage: 'feed' }));
app.post('/create-post', (req, res) => res.redirect('/feed'));

// My profile
app.get('/profile', (req, res) => res.render('profile', { profile: myProfile, activeTab: 'posts', activePage: 'profile' }));
app.get('/profile/saved', (req, res) => res.render('profile', { profile: myProfile, activeTab: 'saved', activePage: 'profile' }));

// Other user profile
app.get('/user/:slug', (req, res) => {
  const user = otherUsers.find(u => u.slug === req.params.slug);
  if (!user) return res.redirect('/feed');
  const tab = req.query.tab || 'posts';
  res.render('user-profile', { user, activeTab: tab, activePage: 'feed' });
});

// Messages
app.get('/messages', (req, res) => res.render('messages', { conversations, activePage: 'messages' }));
app.get('/messages/new', (req, res) => res.render('new-message', { suggestedUsers, activePage: 'messages' }));
app.get('/messages/:id', (req, res) => {
  const convo = conversations.find(c => c.id === parseInt(req.params.id));
  if (!convo) return res.redirect('/messages');
  res.render('chatbox', { convo, activePage: 'messages' });
});
app.post('/messages/:id', (req, res) => res.redirect(`/messages/${req.params.id}`));
app.post('/messages/new', (req, res) => res.redirect('/messages'));


// ─── Events Data ──────────────────────────────────────────────
const events = [
  {
    id: 1,
    slug: 'spring-thrift-sale',
    title: 'Spring Thrift Sale',
    image: '/images/event1.jpg',        
    cover: '/images/event1.jpg',
    date: 'March 15, 2026',
    time: '10:00 AM - 4:00 PM',
    location: 'Community Center',
    address: '456 Oak Avenue',
    attendees: 45,
    about: 'Join us for our annual Spring Thrift Sale! Browse through hundreds of vintage clothing items, home decor, books, and more. All proceeds go to local charities. Meet fellow thrift enthusiasts, discover unique finds, and enjoy refreshments while you shop.',
    attendeeAvatars: 8,
    attendeeExtra: 37,
  },
  {
    id: 2,
    slug: 'upcycling-workshop',
    title: 'Upcycling Workshop',
    image: '/images/event2.jpg',        
    cover: '/images/event2.jpg',
    date: 'March 20, 2026',
    time: '2:00 PM - 5:00 PM',
    location: 'Maker Space Downtown',
    address: '12 Craft Lane',
    attendees: 28,
    about: 'Learn creative upcycling techniques from local experts. Bring your old clothes and leave with something new! All materials provided. Great for beginners and experienced crafters alike.',
    attendeeAvatars: 6,
    attendeeExtra: 22,
  },
  {
    id: 3,
    slug: 'vintage-fashion-show',
    title: 'Vintage Fashion Show',
    image: '/images/event3.jpg',        
    cover: '/images/event3.jpg',
    date: 'March 25, 2026',
    time: '6:00 PM - 9:00 PM',
    location: 'Art Gallery',
    address: '88 Gallery Road',
    attendees: 67,
    about: 'An evening celebrating vintage style and sustainable fashion. Watch local designers and community members showcase their best vintage finds and upcycled outfits. Refreshments included.',
    attendeeAvatars: 8,
    attendeeExtra: 59,
  },
];

// ─── Discover / Stores Data ────────────────────────────────────
const stores = [
  {
    id: 1,
    slug: 'vintage-treasures',
    name: 'Vintage Treasures',
    image: '/images/store1.jpg',       
    photos: '/images/store1.jpg',      
    rating: 4.5,
    reviewCount: 127,
    distance: '0.8 miles',
    description: 'Great selection of vintage clothing and home decor',
    address: '123 Main Street, Downtown',
    hours: 'Mon-Sat: 10am - 7pm, Sun: 12pm - 5pm',
    contact: '(555) 123-4567',
    reviews: [
      { author: 'Sarah M.', initials: 'SM', rating: 5, timeAgo: '2 days ago', text: 'Amazing selection of vintage items!' },
      { author: 'Mike R.',  initials: 'MR', rating: 3, timeAgo: '1 week ago', text: 'Great prices, friendly staff' },
      { author: 'Emma L.',  initials: 'EL', rating: 5, timeAgo: '2 weeks ago', text: 'My favorite thrift store!' },
    ],
  },
  {
    id: 2,
    slug: 'second-chance-thrift',
    name: 'Second Chance Thrift',
    image: '/images/store2.jpg',       
    photos: '/images/store2.jpg',
    rating: 4.2,
    reviewCount: 89,
    distance: '1.2 miles',
    description: 'Great selection of vintage clothing and home decor',
    address: '45 Bridge Street',
    hours: 'Mon-Sun: 9am - 6pm',
    contact: '(555) 987-6543',
    reviews: [
      { author: 'Alex K.',  initials: 'AK', rating: 4, timeAgo: '3 days ago', text: 'Good variety, reasonable prices.' },
      { author: 'Jess B.', initials: 'JB', rating: 5, timeAgo: '1 month ago', text: 'Hidden gem in the city!' },
    ],
  },
  {
    id: 3,
    slug: 'retro-revival',
    name: 'Retro Revival',
    image: '/images/store3.jpg',       
    photos: '/images/store3.jpg',
    rating: 4.8,
    reviewCount: 203,
    distance: '1.5 miles',
    description: 'Great selection of vintage clothing and home decor',
    address: '77 Retro Lane',
    hours: 'Tue-Sun: 11am - 8pm',
    contact: '(555) 456-7890',
    reviews: [
      { author: 'David M.', initials: 'DM', rating: 5, timeAgo: '1 day ago', text: 'Best retro finds in town!' },
      { author: 'Sarah M.', initials: 'SM', rating: 5, timeAgo: '5 days ago', text: 'Incredible collection, will be back.' },
    ],
  },
];

// ─── Events Routes ─────────────────────────────────────────────
app.get('/events', (req, res) => res.render('events', { events, activePage: 'events' }));

app.get('/events/:slug', (req, res) => {
  const event = events.find(e => e.slug === req.params.slug);
  if (!event) return res.redirect('/events');
  res.render('event-details', { event, activePage: 'events' });
});

app.post('/events/:slug/rsvp', (req, res) => res.redirect(`/events/${req.params.slug}`));

// ─── Discover / Store Routes ───────────────────────────────────
app.get('/discover', (req, res) => {
  const q = req.query.q || '';
  const filtered = q ? stores.filter(s => s.name.toLowerCase().includes(q.toLowerCase())) : stores;
  res.render('discover', { stores: filtered, query: q, activePage: 'discover' });
});

app.get('/store/:slug', (req, res) => {
  const store = stores.find(s => s.slug === req.params.slug);
  if (!store) return res.redirect('/discover');
  res.render('store', { store, activePage: 'discover' });
});

app.get('/store/:slug/review', (req, res) => {
  const store = stores.find(s => s.slug === req.params.slug);
  if (!store) return res.redirect('/discover');
  res.render('write-review', { store, activePage: 'discover' });
});

app.post('/store/:slug/review', (req, res) => res.redirect(`/store/${req.params.slug}`));

// Notifications
app.get('/notifications', (req, res) => {
    const notifications = [
        { type: 'like',    icon: '❤️',  actor: 'Mike R.',            action: 'liked your post',         time: '5 minutes ago' },
        { type: 'comment', icon: '💬',  actor: 'Emma L.',            action: 'commented on your post',  time: '1 hour ago' },
        { type: 'follow',  icon: '👤',  actor: 'John D.',            action: 'started following you',   time: '2 hours ago' },
        { type: 'system',  icon: '📅',  actor: 'Spring Thrift Sale', action: 'is starting tomorrow',    time: '3 hours ago' },
        { type: 'like',    icon: '❤️',  actor: 'Alex K.',            action: 'liked your post',         time: '5 hours ago' },
    ];
    res.render('notifications', { notifications, activePage: 'notifications' });  
});

// Settings
app.get('/settings', (req, res) => {
    res.render('settings', { activePage: 'settings' });  
});

// Logout
app.get('/logout', (req, res) => {
    res.redirect('/login');
});

app.listen(3001, () => console.log('UpThrift running on http://localhost:3001'));

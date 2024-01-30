const characters = [
  {
    name: 'Alex',
    avatar: 'avatar-alex.jpg',
  },
  {
    name: 'Chun-Li',
    avatar: 'avatar-chun-li.jpg',
  },
  {
    name: 'Dudley',
    avatar: 'avatar-dudley.jpg',
  },
  {
    name: 'Elena',
    avatar: 'avatar-elena.jpg',
  },
  {
    name: 'Gill',
    avatar: 'avatar-gill.jpg',
  },
  {
    name: 'Gouki',
    avatar: 'avatar-gouki.jpg',
  },
  {
    name: 'Hugo',
    avatar: 'avatar-hugo.jpg',
  },
  {
    name: 'Ibuki',
    avatar: 'avatar-ibuki.jpg',
  },
  {
    name: 'Ken',
    avatar: 'avatar-ken.jpg',
  },
  {
    name: 'Makoto',
    avatar: 'avatar-makoto.jpg',
  },
  {
    name: 'Necro',
    avatar: 'avatar-necro.jpg',
  },
  {
    name: 'Oro',
    avatar: 'avatar-oro.jpg',
  },
  {
    name: 'Q',
    avatar: 'avatar-q.jpg',
  },
  {
    name: 'Remy',
    avatar: 'avatar-remy.jpg',
  },
  {
    name: 'Ryu',
    avatar: 'avatar-ryu.jpg',
  },
  {
    name: 'Sean',
    avatar: 'avatar-sean.jpg',
  },
  {
    name: 'Twelve',
    avatar: 'avatar-twelve.jpg',
  },
  {
    name: 'Urien',
    avatar: 'avatar-urien.jpg',
  },
  {
    name: 'Yang',
    avatar: 'avatar-yang.jpg',
  },
  {
    name: 'Yun',
    avatar: 'avatar-yun.jpg',
  },
];

const getRandomCharacter = () => characters[Math.floor(Math.random() * characters.length)];

export { characters, getRandomCharacter };

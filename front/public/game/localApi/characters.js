const characters = [
  {
    name: 'Alex',
    avatar: 'assets/img/avatar-alex.jpg',
  },
  {
    name: 'Chun-Li',
    avatar: 'assets/img/avatar-chun-li.jpg',
  },
  {
    name: 'Dudley',
    avatar: 'assets/img/avatar-dudley.jpg',
  },
  {
    name: 'Elena',
    avatar: 'assets/img/avatar-elena.jpg',
  },
  {
    name: 'Gill',
    avatar: 'assets/img/avatar-gill.jpg',
  },
  {
    name: 'Gouki',
    avatar: 'assets/img/avatar-gouki.jpg',
  },
  {
    name: 'Hugo',
    avatar: 'assets/img/avatar-hugo.jpg',
  },
  {
    name: 'Ibuki',
    avatar: 'assets/img/avatar-ibuki.jpg',
  },
  {
    name: 'Ken',
    avatar: 'assets/img/avatar-ken.jpg',
  },
  {
    name: 'Makoto',
    avatar: './assets/img/avatar-makoto.jpg',
  },
  {
    name: 'Necro',
    avatar: './assets/img/avatar-necro.jpg',
  },
  {
    name: 'Oro',
    avatar: './assets/img/avatar-oro.jpg',
  },
  {
    name: 'Q',
    avatar: './assets/img/avatar-q.jpg',
  },
  {
    name: 'Remy',
    avatar: './assets/img/avatar-remy.jpg',
  },
  {
    name: 'Ryu',
    avatar: './assets/img/avatar-ryu.jpg',
  },
  {
    name: 'Sean',
    avatar: './assets/img/avatar-sean.jpg',
  },
  {
    name: 'Twelve',
    avatar: './assets/img/avatar-twelve.jpg',
  },
  {
    name: 'Urien',
    avatar: './assets/img/avatar-urien.jpg',
  },
  {
    name: 'Yang',
    avatar: './assets/img/avatar-yang.jpg',
  },
  {
    name: 'Yun',
    avatar: './assets/img/avatar-yun.jpg',
  },
];

const getRandomCharacter = () => characters[Math.floor(Math.random() * characters.length)];

export { characters, getRandomCharacter };

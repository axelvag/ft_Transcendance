const characters = [
  {
    id: 'ryu',
    name: 'Ryu',
    avatar: './assets/img/avatar-ryu.jpg',
  },
  {
    id: 'ken',
    name: 'Ken',
    avatar: './assets/img/avatar-ken.jpg',
  },
  {
    id: 'alex',
    name: 'Alex',
    avatar: './assets/img/avatar-alex.jpg',
  },
  {
    id: 'chun-li',
    name: 'Chun-Li',
    avatar: './assets/img/avatar-chun-li.jpg',
  },
  {
    id: 'dudley',
    name: 'Dudley',
    avatar: './assets/img/avatar-dudley.jpg',
  },
  {
    id: 'elena',
    name: 'Elena',
    avatar: './assets/img/avatar-elena.jpg',
  },
  {
    id: 'gill',
    name: 'Gill',
    avatar: './assets/img/avatar-gill.jpg',
  },
  {
    id: 'gouki',
    name: 'Gouki',
    avatar: './assets/img/avatar-gouki.jpg',
  },
  {
    id: 'hugo',
    name: 'Hugo',
    avatar: './assets/img/avatar-hugo.jpg',
  },
  {
    id: 'ibuki',
    name: 'Ibuki',
    avatar: './assets/img/avatar-ibuki.jpg',
  },
  {
    id: 'makoto',
    name: 'Makoto',
    avatar: './assets/img/avatar-makoto.jpg',
  },
  {
    id: 'necro',
    name: 'Necro',
    avatar: './assets/img/avatar-necro.jpg',
  },
  {
    id: 'oro',
    name: 'Oro',
    avatar: './assets/img/avatar-oro.jpg',
  },
  {
    id: 'q',
    name: 'Q',
    avatar: './assets/img/avatar-q.jpg',
  },
  {
    id: 'remy',
    name: 'Remy',
    avatar: './assets/img/avatar-remy.jpg',
  },
  {
    id: 'sean',
    name: 'Sean',
    avatar: './assets/img/avatar-sean.jpg',
  },
  {
    id: 'twelve',
    name: 'Twelve',
    avatar: './assets/img/avatar-twelve.jpg',
  },
  {
    id: 'urien',
    name: 'Urien',
    avatar: './assets/img/avatar-urien.jpg',
  },
  {
    id: 'yang',
    name: 'Yang',
    avatar: './assets/img/avatar-yang.jpg',
  },
  {
    id: 'yun',
    name: 'Yun',
    avatar: './assets/img/avatar-yun.jpg',
  },
];

const getCharacter = id => characters.find(character => character.id === id);

export { characters, getCharacter };

const characters = [
  {
    id: 'character-ryu',
    name: 'Ryu',
    avatar: 'assets/img/avatar-ryu.jpg',
  },
  {
    id: 'character-ken',
    name: 'Ken',
    avatar: 'assets/img/avatar-ken.jpg',
  },
  {
    id: 'character-sean',
    name: 'Sean',
    avatar: 'assets/img/avatar-sean.jpg',
  },
  {
    id: 'character-remy',
    name: 'Remy',
    avatar: 'assets/img/avatar-remy.jpg',
  },
  {
    id: 'character-elena',
    name: 'Elena',
    avatar: 'assets/img/avatar-elena.jpg',
  },
  {
    id: 'character-ibuki',
    name: 'Ibuki',
    avatar: 'assets/img/avatar-ibuki.jpg',
  },
  {
    id: 'character-makoto',
    name: 'Makoto',
    avatar: 'assets/img/avatar-makoto.jpg',
  },
  {
    id: 'character-yun',
    name: 'Yun',
    avatar: 'assets/img/avatar-yun.jpg',
  },
  {
    id: 'character-yang',
    name: 'Yang',
    avatar: 'assets/img/avatar-yang.jpg',
  },
  {
    id: 'character-necro',
    name: 'Necro',
    avatar: 'assets/img/avatar-necro.jpg',
  },
  {
    id: 'character-twelve',
    name: 'Twelve',
    avatar: 'assets/img/avatar-twelve.jpg',
  },
  {
    id: 'character-chun-li',
    name: 'Chun-Li',
    avatar: 'assets/img/avatar-chun-li.jpg',
  },
  {
    id: 'character-dudley',
    name: 'Dudley',
    avatar: 'assets/img/avatar-dudley.jpg',
  },
  {
    id: 'character-alex',
    name: 'Alex',
    avatar: 'assets/img/avatar-alex.jpg',
  },
  {
    id: 'urien',
    name: 'Urien',
    avatar: 'assets/img/avatar-urien.jpg',
  },
  {
    id: 'character-oro',
    name: 'Oro',
    avatar: 'assets/img/avatar-oro.jpg',
  },
  {
    id: 'character-hugo',
    name: 'Hugo',
    avatar: 'assets/img/avatar-hugo.jpg',
  },
  {
    id: 'character-gouki',
    name: 'Gouki',
    avatar: 'assets/img/avatar-gouki.jpg',
  },
  {
    id: 'character-gill',
    name: 'Gill',
    avatar: 'assets/img/avatar-gill.jpg',
  },
  {
    id: 'character-q',
    name: 'Q',
    avatar: 'assets/img/avatar-q.jpg',
  },
];

const getRandomCharacter = () => characters[Math.floor(Math.random() * characters.length)];

export { characters, getRandomCharacter };

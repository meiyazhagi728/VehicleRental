let locations = [
  { id: 'cbe', name: 'Coimbatore' },
  { id: 'erd', name: 'Erode' }
];

module.exports = {
  getAll() {
    return locations;
  },
  add(name) {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (!locations.find(l => l.name.toLowerCase() === name.toLowerCase())) {
      locations.push({ id, name });
    }
    return locations;
  },
  remove(id) {
    locations = locations.filter(l => l.id !== id);
    return locations;
  }
};



const table = document.getElementById('types');
const typename = document.getElementById('typename');
const typemons = document.getElementById('typemons');

const combos = [];

var typeList, monList, variantList, lastSelectedCell;

run();

async function loadData() {
  typeList = await fetch('./types.json') .then(response => response.json());
  monList = await fetch('./pokedex.json').then(response => response.json());
  variantList = await fetch('./variants.json').then(response => response.json());
}

class Combo {
  constructor(types) {
    this.types = [...types];
    this.items = [];
  }

  add(mon) {
    this.items.push(mon);
  }

  matches(types) {
    // checks if types match all combo's types
    const sameNumTypes = this.types.length === types.length;
    const foundAllTypes = types.map(type => {
      return this.types.indexOf(type) > -1;
    });
    return sameNumTypes && foundAllTypes.reduce((check, curr) => {
      return check && curr;
    }, true);
  }
}

async function run() {
  await loadData();

  const monsAndVariants = [
    ...monList,
    ...variantList
  ];

  // create found combos objects
  monsAndVariants.forEach(mon => {
    // check if a combo exists
    let foundCombo = combos.find(someCombo => {
      return someCombo.matches(mon.type);
    });

    // if not, add it to the list
    if (!foundCombo) {
      foundCombo = new Combo(mon.type);
      combos.push(foundCombo);
    }

    // add mon to combo
    foundCombo.add(mon.name.english);
  });

  const highestCount = Math.max(...combos.map(combo => combo.items.length));

  // make table
  {
    // head
    const thead = document.createElement('thead');
    const trow = document.createElement('tr');
    let hcell = document.createElement('th');
    hcell.textContent = '';
    trow.appendChild(hcell);
    typeList.forEach(type => {
      hcell = document.createElement('th');
      hcell.textContent = type.english;
      trow.appendChild(hcell);
    });
    thead.appendChild(trow);
    table.appendChild(thead);
  }

  // body
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  typeList.forEach(typea => {
    const trow = document.createElement('tr');
    const hcell = document.createElement('th');
    hcell.textContent = typea.english;
    trow.appendChild(hcell);
    typeList.forEach(typeb => {
      const tcell = document.createElement('td');
      trow.appendChild(tcell);
      const types = [typea.english];
      if (typea.english !== typeb.english) {
        types.push(typeb.english);
      }
      const foundCombo = combos.find(combo => combo.matches(types));
      const count = foundCombo ? foundCombo.items.length : 0;
      tcell.textContent = count;
      tcell.style.backgroundColor = `rgba(0,128,0, ${Math.pow(count / highestCount, 0.5)})`;
      tcell.setAttribute('data-types', types.join(','));
    })
    tbody.appendChild(trow);
  });

  tbody.addEventListener('click', evt => {
    evt.preventDefault();
    let types = evt.target.getAttribute('data-types');
    if (!types) {
      return false;
    }
    if (lastSelectedCell) {
      lastSelectedCell.classList.remove('selected');
    }
    evt.target.classList.add('selected');
    lastSelectedCell = evt.target;
    types = types.split(',');
    const foundCombo = combos.find(combo => combo.matches(types));
    typename.textContent = `Types: ${types.join(', ')}`;
    typemons.innerHTML = '';
    if (foundCombo) {
      foundCombo.items.forEach(mon => {
        const listItem = document.createElement('li');
        listItem.textContent = mon;
        typemons.appendChild(listItem);
      });
    }
    else {
      const listItem = document.createElement('li');
      listItem.textContent = 'No Pokemon found';
      typemons.appendChild(listItem);
    }
  });

}
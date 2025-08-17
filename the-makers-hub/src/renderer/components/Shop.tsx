import React from 'react';

const stores = [
  {
    name: '3DJake',
    url: 'https://www.3djake.com/',
    description: 'A leading 3D printing online shop with a wide selection of products.',
  },
  {
    name: 'MatterHackers',
    url: 'https://www.matterhackers.com/',
    description: 'A popular US-based store with a huge inventory of filaments, printers, and accessories.',
  },
  {
    name: 'Printed Solid',
    url: 'https://www.printedsolid.com/',
    description: 'Another popular US-based store, known for its high-quality filaments.',
  },
  {
    name: 'Filamentive',
    url: 'https://filamentive.com/',
    description: 'A UK-based store that specializes in recycled filaments.',
  },
  {
    name: 'PrusaPrinters',
    url: 'https://www.prusa3d.com/',
    description: 'The official store for Prusa printers and filaments.',
  },
];

const Shop = () => {
  return (
    <div>
      <h2>Shop</h2>
      <p>Here are some popular online stores for 3D printing supplies:</p>
      <ul>
        {stores.map((store) => (
          <li key={store.name}>
            <a href={store.url} target="_blank" rel="noopener noreferrer">
              {store.name}
            </a>
            <p>{store.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Shop;

import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
  async beforeModel() {
    const dataToFetch = ['products', 'users'];

    if (localStorage.getItem('hasInitialized') !== 'true') {
      for (let resource of dataToFetch) {
        const res = await fetch(`https://dummyjson.com/${resource}?limit=500`);
        let data = await res.json();

        if (resource === 'users') {
          data = {
            ...data,
            users: data.users.map(user => ({
              ...user,
              orders: [],
              favourites: [],
              cart: [],
            })),
          };
          localStorage.setItem('orders', JSON.stringify({ orders: [] }));
        }

        localStorage.setItem(resource, JSON.stringify(data));
      }

      localStorage.setItem('hasInitialized', 'true');
    }
  }
}

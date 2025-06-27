export async function initialize(application) {
  // The purpose of this initializer is 
  // to fetch the data from third party
  // set them in localhost.

  let defaultDataToSearch = ['products', 'users']

  // Default user datas and product datas
  if (!(localStorage.getItem('hasInitialized') === 'true')) {
    let a = 1;

    for (let val of defaultDataToSearch ) {
      console.log(a++);
      let data = await loadDefaultData(val);
      if(val == 'users') data = setDefaultValuesForAllUser(data);
      localStorage.setItem(val, JSON.stringify(data));
    }
    localStorage.setItem('hasInitialized', 'true')

  }

  // Reusable function to load default datas.
  async function loadDefaultData(dataFor) {
    let response = await fetch(`https://dummyjson.com/${dataFor}?limit=500`);
    return await response.json();
  }

  function setDefaultValuesForAllUser(usersObj) {

    usersObj.users = usersObj.users.map(user => ({
      ...user,
      orders: [],
      favourites: [],
      cart: []
    }));

    return usersObj;
  }
}

export default {
  initialize,
}
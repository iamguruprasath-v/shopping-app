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
      localStorage.setItem(val, JSON.stringify(data));
    }
    console.log('here')
    localStorage.setItem('hasInitialized', 'true')

  }

  // Reusable function to load default datas.
  async function loadDefaultData(dataFor) {
    let response = await fetch(`https://dummyjson.com/${dataFor}?limit=500`);
    return await response.json();
  }
}

export default {
  initialize,
}
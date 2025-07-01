// app/helpers/range.js
import { helper } from '@ember/component/helper';

export default helper(function range([start, end]) {
  console.log(start, end)
  let result = [];

  for (let i = start; i < end; i++) {
    result.push(i);
  }

  return result;
});

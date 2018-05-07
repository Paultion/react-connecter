export default class AppStore {
  value = 1;
  test = {
    a: 1,
  };

  updateValue() {
    this.value++;
  }

  updateTest() {
    this.test = 2;
  }

}

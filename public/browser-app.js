const formDOM = document.querySelector('.login-form');
formDOM.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;
  const dataContainerDOM = document.querySelector('.dataContainer');
  try {
    const {
      data: { msg, token },
    } = await axios.post('/user/login', { username, password });

    if (token) {
      localStorage.setItem('token', token);
      //dataContainerDOM.innerHTML = '<h1>' + msg + '</h1>';
    }
  } catch (error) {
    dataContainerDOM.innerHTML = '<h1>' + error + '</h1>';
  }
});

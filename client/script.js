document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authSection = document.getElementById('auth-section');
  const fileSection = document.getElementById('file-section');
  const usernameDisplay = document.getElementById('username-display');
  const userInfo = document.getElementById('user-info');
  const logoutBtn = document.getElementById('logout-btn');
  const fileList = document.getElementById('fileList');
  const socket = new WebSocket('ws://localhost:3000');

  document.getElementById('show-register-form').addEventListener('click', () => {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      document.getElementById('auth-title').innerText = 'Register';
  });

  document.getElementById('show-login-form').addEventListener('click', () => {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      document.getElementById('auth-title').innerText = 'Login';
  });

  loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;

      try {
          const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username, password })
          });

          if (response.ok) {
              const data = await response.json();
              localStorage.setItem('jwtToken', data.token);
              usernameDisplay.innerText = username;
              authSection.style.display = 'none';
              fileSection.style.display = 'block';
              userInfo.style.display = 'flex';
              loadFiles();
          } else {
              const error = await response.json();
              alert(`Login failed: ${error.error}`);
          }
      } catch (error) {
          console.error('Error during login:', error);
      }
  });

  registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value;
      const password = document.getElementById('register-password').value;

      try {
          const response = await fetch('/api/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username, password })
          });

          if (response.ok) {
              alert('Registration successful! Please login.');
              registerForm.style.display = 'none';
              loginForm.style.display = 'block';
              document.getElementById('auth-title').innerText = 'Login';
          } else {
              alert('Registration failed!');
          }
      } catch (error) {
          console.error('Error during registration:', error);
      }
  });

  logoutBtn.addEventListener('click', async () => {
      try {
          await fetch('/api/logout', { method: 'POST' });
          localStorage.removeItem('jwtToken'); 
          authSection.style.display = 'block';
          fileSection.style.display = 'none';
          userInfo.style.display = 'none';
      } catch (error) {
          console.error('Error during logout:', error);
      }
  });

  document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData();
      const fileInput = document.getElementById('fileInput');

      if (fileInput.files.length === 0) {
          alert('Please select a file');
          return;
      }

      formData.append('file', fileInput.files[0]);

      try {
          const response = await makeAuthenticatedRequest('/api/upload', {
              method: 'POST',
              body: formData
          });

          if (response.ok) {
              alert('File uploaded successfully');
              loadFiles();
              socket.send(JSON.stringify({ action: 'file-uploaded', filename: fileInput.files[0].name }));
          } else {
              alert('File upload failed');
          }
      } catch (error) {
          console.error('Error during file upload:', error);
      }
  });

  async function loadFiles() {
      try {
          const response = await makeAuthenticatedRequest('/api/files');
          const files = await response.json();

          fileList.innerHTML = '';
          files.forEach(file => {
              const listItem = document.createElement('li');
              listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
              listItem.innerHTML = `
                  ${file}
                  <div>
                      <a href="/api/files/download/${file}" class="btn btn-primary btn-sm mr-2">Download</a>
                      <button class="btn btn-danger btn-sm" onclick="deleteFile('${file}')">Delete</button>
                  </div>
              `;
              fileList.appendChild(listItem);
          });
      } catch (error) {
          console.error('Error loading files:', error);
      }
  }

  window.deleteFile = async function (filename) {
      try {
          const response = await makeAuthenticatedRequest(`/api/files/${filename}`, {
              method: 'DELETE'
          });

          if (response.ok) {
              alert('File deleted successfully');
              loadFiles();
              socket.send(JSON.stringify({ action: 'file-deleted', filename }));
          } else {
              alert('File deletion failed');
          }
      } catch (error) {
          console.error('Error during file deletion:', error);
      }
  }

  async function makeAuthenticatedRequest(url, options = {}) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
          options.headers = {
              ...options.headers,
              'Authorization': `Bearer ${token}`
          };
      }
      const response = await fetch(url, options);
      return response;
  }

  socket.onopen = () => {
      console.log('WebSocket connection established');
  };

  socket.onmessage = (event) => {
      console.log(`Received message: ${event.data}`);
  };

  socket.onclose = () => {
      console.log('WebSocket connection closed');
  };

  socket.onerror = (error) => {
      console.error('WebSocket error:', error);
  };
});
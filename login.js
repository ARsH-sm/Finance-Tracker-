function login() {
  const inputUsername = document.getElementById("username").value;
  const inputPassword = document.getElementById("password").value;

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: inputUsername,
      password: inputPassword
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem("user", data.username);
      localStorage.setItem("budget", data.budget || 0);
      window.location.href = "index.html";
    } else {
      document.getElementById("msg").textContent = "Invalid Credentials";
    }
  })
  .catch(() => {
    document.getElementById("msg").textContent = "Server not running";
  });
}

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const msg = document.getElementById('msg');

// Register user
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const referral = document.getElementById('referral').value;

  try {
    const userCred = await auth.createUserWithEmailAndPassword(email, password);
    // Add user to Firestore
    await db.collection('users').doc(userCred.user.uid).set({
      name,
      email,
      coins: 0,
      referralCode: Math.random().toString(36).substring(2,8),
      referredBy: referral || null,
      tasksCompleted: []
    });
    msg.innerText = "Registered! Please login.";
  } catch(err) {
    msg.innerText = err.message;
  }
});

// Login user
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const userCred = await auth.signInWithEmailAndPassword(email, password);
    localStorage.setItem('userId', userCred.user.uid);
    window.location.href = 'dashboard.html';
  } catch(err) {
    msg.innerText = err.message;
  }
});

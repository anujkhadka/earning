const userId = localStorage.getItem('userId');
const userNameEl = document.getElementById('userName');
const coinsEl = document.getElementById('coins');
const tasksContainer = document.getElementById('tasksContainer');
const dashboardMsg = document.getElementById('dashboardMsg');
const logoutBtn = document.getElementById('logoutBtn');
const withdrawBtn = document.getElementById('withdrawBtn');

if(!userId) window.location.href = 'index.html';

// Logout
logoutBtn.addEventListener('click', () => {
  auth.signOut();
  localStorage.removeItem('userId');
  window.location.href = 'index.html';
});

// Load user data
async function loadUser() {
  const doc = await db.collection('users').doc(userId).get();
  const user = doc.data();
  userNameEl.innerText = user.name;
  coinsEl.innerText = user.coins;
}
loadUser();

// Load tasks
async function loadTasks() {
  const snapshot = await db.collection('tasks').get();
  tasksContainer.innerHTML = '';
  snapshot.forEach(doc => {
    const task = doc.data();
    const div = document.createElement('div');
    div.innerHTML = `${task.title} → Reward: ${task.rewardCoins} coins <button>Complete</button>`;
    const btn = div.querySelector('button');
    btn.addEventListener('click', async () => {
      await completeTask(doc.id, task.rewardCoins);
    });
    tasksContainer.appendChild(div);
  });
}
loadTasks();

// Complete task
async function completeTask(taskId, reward) {
  const userDoc = db.collection('users').doc(userId);
  const doc = await userDoc.get();
  const user = doc.data();
  if(user.tasksCompleted.includes(taskId)) {
    dashboardMsg.innerText = "Task already completed!";
    return;
  }
  user.tasksCompleted.push(taskId);
  user.coins += reward;
  await userDoc.update({ coins: user.coins, tasksCompleted: user.tasksCompleted });
  coinsEl.innerText = user.coins;
  dashboardMsg.innerText = "Task completed!";
}

// Withdraw coins
withdrawBtn.addEventListener('click', async () => {
  const amount = parseInt(document.getElementById('withdrawAmount').value);
  const method = document.getElementById('paymentMethod').value;
  if(!amount || amount <= 0) return dashboardMsg.innerText = "Enter valid amount!";
  const userDoc = db.collection('users').doc(userId);
  const doc = await userDoc.get();
  const user = doc.data();
  if(user.coins < amount) return dashboardMsg.innerText = "Not enough coins!";
  // Subtract coins
  await userDoc.update({ coins: user.coins - amount });
  coinsEl.innerText = user.coins;
  // Add withdrawal request
  await db.collection('withdrawals').add({
    userId,
    coins: amount,
    status: 'pending',
    paymentMethod: method,
    requestedAt: new Date()
  });
  dashboardMsg.innerText = "Withdrawal requested!";
});

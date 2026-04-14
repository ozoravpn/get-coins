let currentUsername = "thamuz_indo";
let selectedCoins = 30;
let selectedPrice = 0.40;
const pricePerCoin = 0.014; // Price per coin in Dollars (e.g., $1.40 / 100 coins)
let customValueStr = "";
const defaultAvatarUrl = "url('https://i.ibb.co/5R2VNRk/34c4032d077f8182e179f70031c05119.png')";

// Format numbers with commas (thousands)
function formatNumber(num) { 
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
}

// Format large follower numbers (e.g., 1.5M, 10K)
function formatFollowers(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return formatNumber(num);
}

// Fetch user data from API
async function searchApiUser(event) {
    event.preventDefault();
    let uid = document.getElementById('uid').value.trim();
    if (!uid) return;
    
    uid = uid.replace('@', '');
    
    const nameEl = document.getElementById('display-name');
    const avatarEl = document.getElementById('display-avatar');
    const followersEl = document.getElementById('display-followers');
    
    nameEl.innerText = "Searching...";
    avatarEl.style.backgroundImage = defaultAvatarUrl; 
    followersEl.style.display = 'inline'; 
    followersEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading...`;
    
    try {
        const response = await fetch(`https://www.tikwm.com/api/user/info?unique_id=${uid}`);
        const data = await response.json();
        
        if (data.code === 0 && data.data) {
            const user = data.data.user;
            const stats = data.data.stats;
            
            currentUsername = user.nickname || user.uniqueId;
            nameEl.innerText = currentUsername;
            
            if (user.avatarMedium || user.avatarLarger) { 
                avatarEl.style.backgroundImage = `url('${user.avatarMedium || user.avatarLarger}')`; 
            }
            
            followersEl.innerHTML = `${formatFollowers(stats.followerCount)} Followers`;
        } else {
            nameEl.innerText = "Not found";
            followersEl.innerHTML = `<span style="color: #fe2c55;">Invalid username</span>`;
        }
    } catch (error) {
        nameEl.innerText = "Network Error";
        followersEl.innerHTML = `<span style="color: #fe2c55;">Failed to connect to API</span>`;
        console.error("API Fetch Error:", error); 
    }
}

// Handle standard coin package selection
function selectPackage(element) {
    document.querySelectorAll('.coin-btn').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
    
    if (element.id !== 'btnCustom') {
        selectedCoins = parseInt(element.getAttribute('data-coins'));
        // Use parseFloat for decimal Dollar prices
        selectedPrice = parseFloat(element.getAttribute('data-price'));
        updateBuyButton();
        document.getElementById('btnCustom').innerHTML = '<div class="custom-text">Custom</div>';
    }
}

// Update the sticky bottom buy button
function updateBuyButton() { 
    document.getElementById('btn-buy-text').innerText = 'Buy for $' + selectedPrice.toFixed(2); 
}

// Open custom coin input modal
function openCustomModal() { 
    closeAllModals(); 
    document.getElementById('modalCustom').style.display = 'flex'; 
    customValueStr = ""; 
    updateCustomUI(); 
}

// Handle keypad inputs for custom modal
function pressKey(val) {
    if (val === 'del') { 
        customValueStr = customValueStr.slice(0, -1); 
    } 
    else if (val === '000') { 
        if (customValueStr.length > 0) customValueStr += '000'; 
    } 
    else { 
        if (customValueStr.length < 8) customValueStr += val; 
    }
    updateCustomUI();
}

// Update UI inside the custom modal
function updateCustomUI() {
    const numVal = parseInt(customValueStr) || 0;
    const inputEl = document.getElementById('customInput');
    const totalText = document.getElementById('customTotalText');
    const btnApply = document.getElementById('btnApplyCustom');
    
    if (customValueStr.length > 0) {
        inputEl.value = formatNumber(numVal); 
        const price = numVal * pricePerCoin;
        totalText.innerText = '$' + price.toFixed(2);
        
        if (numVal >= 30) {
            btnApply.disabled = false; 
            btnApply.style.background = '#fe2c55'; 
            btnApply.dataset.coins = numVal; 
            btnApply.dataset.price = price;
        } else {
            btnApply.disabled = true; 
            btnApply.style.background = 'rgba(254,44,85,0.5)';
        }
    } else {
        inputEl.value = ''; 
        totalText.innerText = '$0.00'; 
        btnApply.disabled = true; 
        btnApply.style.background = 'rgba(254,44,85,0.5)';
    }
}

// Apply the custom coin amount to the main UI
function applyCustom() {
    const btn = document.getElementById('btnApplyCustom');
    if (btn.disabled) return;
    
    selectedCoins = parseInt(btn.dataset.coins);
    selectedPrice = parseFloat(btn.dataset.price);
    
    const btnCustom = document.getElementById('btnCustom');
    document.querySelectorAll('.coin-btn').forEach(b => b.classList.remove('selected'));
    btnCustom.classList.add('selected');
    
    btnCustom.innerHTML = `
        <div class="coin-amount-row" style="margin-bottom:0;">
            <img src="Koin-tiktok.png" alt="TikTok Coin" class="tiktok-coin-icon">
            <span>${formatNumber(selectedCoins)}</span>
        </div>
        <div class="coin-price">$${selectedPrice.toFixed(2)}</div>
    `;
    
    updateBuyButton();
    closeAllModals();
}

// Close all active modals
function closeAllModals() { 
    document.querySelectorAll('.modal-overlay').forEach(el => el.style.display = 'none'); 
    closeSummaryView();
    closeBankSelection();
    closePaymentMethods();
    closeAddCard(); 
}

// Open order summary view
function openOrderSummary() {
    document.getElementById('summary-view-user').innerText = currentUsername;
    const currentAvatarBg = document.getElementById('display-avatar').style.backgroundImage;
    document.getElementById('summary-view-avatar').style.backgroundImage = currentAvatarBg || defaultAvatarUrl;
    
    document.getElementById('summary-view-coins').innerText = `${formatNumber(selectedCoins)} Coins purchase`;
    document.getElementById('summary-view-price').innerText = `$${selectedPrice.toFixed(2)}`;
    document.getElementById('summary-view-total').innerText = `$${selectedPrice.toFixed(2)}`;

    const view = document.getElementById('summaryView');
    view.style.display = 'flex';
    setTimeout(() => { view.classList.add('active'); }, 10);
}

function closeSummaryView() {
    const view = document.getElementById('summaryView');
    view.classList.remove('active');
    setTimeout(() => { view.style.display = 'none'; }, 250); 
}

// Toggle radio buttons in summary view
function toggleRadio(element) {
    document.querySelectorAll('#summaryView .summary-radio').forEach(r => r.classList.remove('active'));
    const radio = element.querySelector('.summary-radio');
    if (radio) radio.classList.add('active');
}

// Open all payment methods view
function openPaymentMethods() {
    document.getElementById('pm-view-total').innerText = `$${selectedPrice.toFixed(2)}`;
    const view = document.getElementById('paymentMethodsView');
    view.style.display = 'flex';
    setTimeout(() => { view.classList.add('active'); }, 10);
}

function closePaymentMethods() {
    const view = document.getElementById('paymentMethodsView');
    view.classList.remove('active');
    setTimeout(() => { view.style.display = 'none'; }, 250);
}

// Select payment method from full list
function selectPaymentMethod(element) {
    document.querySelectorAll('#paymentMethodsView .summary-radio').forEach(r => r.classList.remove('active'));
    const radio = element.querySelector('.summary-radio');
    if (radio) radio.classList.add('active');
}

// Open bank selection view
function openBankSelection() {
    document.getElementById('bank-view-total').innerText = `$${selectedPrice.toFixed(2)}`;
    const view = document.getElementById('bankSelectionView');
    view.style.display = 'flex';
    setTimeout(() => { view.classList.add('active'); }, 10);
}

function closeBankSelection() {
    const view = document.getElementById('bankSelectionView');
    view.classList.remove('active');
    setTimeout(() => { view.style.display = 'none'; }, 250);
}

// Select a specific bank
function selectBank(element) {
    document.querySelectorAll('#bankSelectionView .summary-radio').forEach(r => r.classList.remove('active'));
    const radio = element.querySelector('.summary-radio');
    if (radio) radio.classList.add('active');
}

// Open add card view
function openAddCard() {
    document.getElementById('card-view-total').innerText = `$${selectedPrice.toFixed(2)}`;
    const view = document.getElementById('addCardView');
    view.style.display = 'flex';
    setTimeout(() => { view.classList.add('active'); }, 10);
}

function closeAddCard() {
    const view = document.getElementById('addCardView');
    view.classList.remove('active');
    setTimeout(() => { view.style.display = 'none'; }, 250);
}

// Process final payment and show success modal
function processPayment() {
    closeSummaryView(); 
    closeBankSelection();
    closePaymentMethods();
    closeAddCard(); 
    
    document.getElementById('modalProcessing').style.display = 'flex';
    
    setTimeout(() => {
        document.getElementById('modalProcessing').style.display = 'none';
        document.getElementById('success-user').innerText = currentUsername;
        document.getElementById('success-coins').innerText = `${formatNumber(selectedCoins)} Coins`;
        document.getElementById('modalSuccess').style.display = 'flex';
    }, 2000);
}
// ==================== STATE MANAGEMENT ====================
let currentOrder = null;
let currentUser = null; // Track logged-in user
let currentDeliveryType = null; // PICKUP_FROM_OWNER or RETURN_TO_OWNER

// 4-photo capture state
let capturedPhotos = {
    front: null,
    back: null,
    left: null,
    right: null
};

let damageDescription = '';

// Storage for delivery data (simulates backend - ready for admin dashboard)
let deliveryData = {};

// ==================== PAGE NAVIGATION ====================
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show the selected page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }

    // Load completed orders when showing orders page
    if (pageId === 'ordersPage') {
        loadCompletedOrders();
    }

    // Update bottom navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Set active nav item based on page
    const navItems = document.querySelectorAll('.nav-item');
    if (pageId === 'dashboardPage') navItems[0]?.classList.add('active');
    if (pageId === 'ordersPage') navItems[1]?.classList.add('active');
    if (pageId === 'earningsPage') navItems[2]?.classList.add('active');
    if (pageId === 'profilePage') navItems[3]?.classList.add('active');
}

// ==================== PASSWORD VISIBILITY TOGGLE ====================
function togglePasswordVisibility(inputId, toggleIcon) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        toggleIcon.style.opacity = '1';
        toggleIcon.textContent = '🙈'; // Closed eye when visible
    } else {
        input.type = 'password';
        toggleIcon.style.opacity = '0.6';
        toggleIcon.textContent = '👁️'; // Open eye when hidden
    }
}

// ==================== LOGIN FUNCTIONALITY ====================

// Valid credentials for demo (you can add more)
const VALID_CREDENTIALS = [
    { email: 'alex@rentex.com', phone: '9876543210', password: 'password123', name: 'Alex Morgan' },
    { email: 'demo@rentex.com', phone: '9999999999', password: 'demo123', name: 'Demo User' },
    { email: 'partner@rentex.com', phone: '8888888888', password: 'partner123', name: 'Partner Account' }
];

// Email validation function
function isValidEmail(email) {
    // Require at least 2 characters after the last dot (.com, .org, .in, etc.)
    // This prevents invalid TLDs like .co, .c, .x
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
}

// Common email domain typos and their corrections
const COMMON_DOMAINS = {
    // Gmail typos
    'gail.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmails.com': 'gmail.com',

    // Yahoo typos
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'yahho.com': 'yahoo.com',
    'yaoo.com': 'yahoo.com',

    // Outlook typos
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
    'outlookk.com': 'outlook.com',

    // Hotmail typos
    'hotmial.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
    'hotmil.com': 'hotmail.com',
    'homail.com': 'hotmail.com'
};

// Check for domain typos
function checkEmailDomain(email) {
    if (!email || !email.includes('@')) {
        return { valid: true, suggestion: null };
    }

    const domain = email.split('@')[1]?.toLowerCase();

    if (COMMON_DOMAINS[domain]) {
        return {
            valid: false,
            suggestion: COMMON_DOMAINS[domain],
            correctedEmail: email.split('@')[0] + '@' + COMMON_DOMAINS[domain]
        };
    }

    return { valid: true, suggestion: null };
}

// Phone validation function (exactly 10 digits)
function isValidPhone(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
}

// Check credentials
function validateCredentials(emailPhone, password) {
    // Check if it's an email or phone
    let isEmail = emailPhone.includes('@');

    if (isEmail) {
        // Validate email format
        if (!isValidEmail(emailPhone)) {
            return { valid: false, message: '⚠️ Please enter a valid email address (e.g., user@example.com)' };
        }

        // Check if email and password match
        const user = VALID_CREDENTIALS.find(u => u.email === emailPhone && u.password === password);
        if (!user) {
            // Check if email exists but password is wrong
            const emailExists = VALID_CREDENTIALS.find(u => u.email === emailPhone);
            if (emailExists) {
                return { valid: false, message: '🔒 Incorrect password! Please try again.' };
            }
            return { valid: false, message: '❌ Email not found. Please check your email or sign up.' };
        }
        return { valid: true, user };

    } else {
        // Validate phone format
        if (!isValidPhone(emailPhone)) {
            return { valid: false, message: '⚠️ Please enter a valid 10-digit phone number' };
        }

        // Check if phone and password match
        const user = VALID_CREDENTIALS.find(u => u.phone === emailPhone && u.password === password);
        if (!user) {
            // Check if phone exists but password is wrong
            const phoneExists = VALID_CREDENTIALS.find(u => u.phone === emailPhone);
            if (phoneExists) {
                return { valid: false, message: '🔒 Incorrect password! Please try again.' };
            }
            return { valid: false, message: '❌ Phone number not found. Please check or sign up.' };
        }
        return { valid: true, user };
    }
}

document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const emailPhone = document.getElementById('emailPhone').value.trim();
    const password = document.getElementById('password').value;

    // Validate inputs are not empty
    if (!emailPhone) {
        showNotification('⚠️ Please enter your email or phone number', 'warning');
        return;
    }

    if (!password) {
        showNotification('⚠️ Please enter your password', 'warning');
        return;
    }

    // Check for email domain typos
    if (emailPhone.includes('@')) {
        const domainCheck = checkEmailDomain(emailPhone);
        if (!domainCheck.valid) {
            showNotification(
                `⚠️ Did you mean "${domainCheck.correctedEmail}"? ` +
                `"${domainCheck.suggestion}" is the correct spelling.`,
                'warning'
            );

            // Shake the form
            const form = document.getElementById('loginForm');
            form.style.animation = 'shake 0.5s';
            setTimeout(() => {
                form.style.animation = '';
            }, 500);
            return;
        }
    }

    // Validate credentials
    const validation = validateCredentials(emailPhone, password);

    if (!validation.valid) {
        showNotification(validation.message, 'error');

        // Shake the form on error
        const form = document.getElementById('loginForm');
        form.style.animation = 'shake 0.5s';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
        return;
    }

    // Valid credentials - proceed with login
    const button = e.target.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner"></span>';
    button.disabled = true;

    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;

        // Set current user
        currentUser = validation.user;

        // Update profile with user information
        updateProfileDisplay();

        showPage('dashboardPage');

        // Show welcome notification
        const userName = currentUser.name || 'Partner';
        showNotification(`Welcome back, ${userName}! 👋`, 'success');
    }, 1500);
});

// Forgot password link
document.getElementById('forgotPasswordLink')?.addEventListener('click', function (e) {
    e.preventDefault();
    showPage('forgotPasswordPage');
});

// Forgot password form submission
document.getElementById('forgotPasswordForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const emailPhone = document.getElementById('resetEmailPhone').value.trim();

    if (!emailPhone) {
        showNotification('⚠️ Please enter your email or phone number', 'warning');
        return;
    }

    // Validate format
    const isEmail = emailPhone.includes('@');
    if (isEmail) {
        if (!isValidEmail(emailPhone)) {
            showNotification('⚠️ Please enter a valid email address', 'warning');
            return;
        }

        // Check for domain typos
        const domainCheck = checkEmailDomain(emailPhone);
        if (!domainCheck.valid) {
            showNotification(
                `⚠️ Did you mean "${domainCheck.correctedEmail}"? ` +
                `"${domainCheck.suggestion}" is the correct spelling.`,
                'warning'
            );
            return;
        }

        // Check if email exists
        const userExists = VALID_CREDENTIALS.find(u => u.email === emailPhone);
        if (!userExists) {
            showNotification('❌ Email not found. Please check your email.', 'error');
            return;
        }
    } else {
        if (!isValidPhone(emailPhone)) {
            showNotification('⚠️ Please enter a valid 10-digit phone number', 'warning');
            return;
        }

        // Check if phone exists
        const userExists = VALID_CREDENTIALS.find(u => u.phone === emailPhone);
        if (!userExists) {
            showNotification('❌ Phone number not found. Please check your number.', 'error');
            return;
        }
    }

    // Show loading
    const button = e.target.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner"></span>';
    button.disabled = true;

    // Simulate sending reset code
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;

        showNotification('✓ Reset code sent! Check your ' + (isEmail ? 'email' : 'phone'), 'success');

        // Navigate to reset password page
        setTimeout(() => {
            showPage('resetPasswordPage');
        }, 1500);
    }, 1500);
});

// Reset password form submission
document.getElementById('resetPasswordForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!newPassword || !confirmPassword) {
        showNotification('⚠️ Please fill in both password fields', 'warning');
        return;
    }

    if (newPassword.length < 6) {
        showNotification('⚠️ Password must be at least 6 characters long', 'warning');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('❌ Passwords do not match! Please try again.', 'error');

        // Shake the form
        const form = document.getElementById('resetPasswordForm');
        form.style.animation = 'shake 0.5s';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
        return;
    }

    // Show loading
    const button = e.target.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner"></span>';
    button.disabled = true;

    // Simulate password reset
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;

        showNotification('✓ Password reset successful! Please login with your new password.', 'success');

        // Navigate back to login page
        setTimeout(() => {
            showPage('loginPage');
            // Clear the form
            document.getElementById('resetPasswordForm').reset();
        }, 2000);
    }, 1500);
});


// ==================== SIGN UP FUNCTIONALITY ====================
document.getElementById('signupForm')?.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const emailPhone = document.getElementById('signupEmailPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validate all fields
    if (!name) {
        showNotification('⚠️ Please enter your full name', 'warning');
        return;
    }

    if (name.length < 3) {
        showNotification('⚠️ Name must be at least 3 characters long', 'warning');
        return;
    }

    if (!emailPhone) {
        showNotification('⚠️ Please enter your email or phone number', 'warning');
        return;
    }

    // Validate email or phone format
    const isEmail = emailPhone.includes('@');
    if (isEmail) {
        if (!isValidEmail(emailPhone)) {
            showNotification('⚠️ Please enter a valid email address (e.g., user@example.com)', 'warning');
            return;
        }

        // Check for domain typos
        const domainCheck = checkEmailDomain(emailPhone);
        if (!domainCheck.valid) {
            showNotification(
                `⚠️ Did you mean "${domainCheck.correctedEmail}"? ` +
                `"${domainCheck.suggestion}" is the correct spelling.`,
                'warning'
            );

            // Shake the form
            const form = document.getElementById('signupForm');
            form.style.animation = 'shake 0.5s';
            setTimeout(() => {
                form.style.animation = '';
            }, 500);
            return;
        }

        // Check if email already exists
        const emailExists = VALID_CREDENTIALS.find(u => u.email === emailPhone);
        if (emailExists) {
            showNotification('❌ This email is already registered. Please login instead.', 'error');
            return;
        }
    } else {
        if (!isValidPhone(emailPhone)) {
            showNotification('⚠️ Please enter a valid 10-digit phone number', 'warning');
            return;
        }

        // Check if phone already exists
        const phoneExists = VALID_CREDENTIALS.find(u => u.phone === emailPhone);
        if (phoneExists) {
            showNotification('❌ This phone number is already registered. Please login instead.', 'error');
            return;
        }
    }

    if (!password) {
        showNotification('⚠️ Please enter a password', 'warning');
        return;
    }

    if (password.length < 6) {
        showNotification('⚠️ Password must be at least 6 characters long', 'warning');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('❌ Passwords do not match! Please try again.', 'error');

        // Shake the form
        const form = document.getElementById('signupForm');
        form.style.animation = 'shake 0.5s';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
        return;
    }

    // Show loading
    const button = e.target.querySelector('button[type="submit"]');
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner"></span>';
    button.disabled = true;

    // Simulate account creation
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;

        // Add new account to credentials (in real app, this would go to backend)
        const newAccount = {
            email: isEmail ? emailPhone : `user${Date.now()}@rentex.com`,
            phone: isEmail ? `${Math.floor(1000000000 + Math.random() * 9000000000)}` : emailPhone,
            password: password,
            name: name
        };
        VALID_CREDENTIALS.push(newAccount);

        // Set as current user
        currentUser = newAccount;

        showNotification(`✓ Account created successfully! Welcome, ${name}! 🎉`, 'success');

        // Navigate to dashboard
        setTimeout(() => {
            showPage('dashboardPage');
            // Clear the form
            document.getElementById('signupForm').reset();

            // Update welcome message and profile
            document.querySelector('.welcome-card h2').textContent = `Welcome, ${name}! 👋`;
            updateProfileDisplay();
        }, 2000);
    }, 1500);
});

// ==================== ORDER ACTIONS ====================
function acceptOrder(orderId, deliveryType) {
    currentDeliveryType = deliveryType;
    showNotification(`Order ${orderId} accepted! 🎉`, 'success');

    // Update UI
    setTimeout(() => {
        viewOrderDetails(orderId, deliveryType);
    }, 1000);
}

function rejectOrder(orderId) {
    const confirmReject = confirm(`Are you sure you want to reject order ${orderId}?`);
    if (confirmReject) {
        showNotification(`Order ${orderId} rejected`, 'info');

        // Remove the order card from view WITHOUT reloading page
        setTimeout(() => {
            // Find and hide the rejected order card
            const orderCards = document.querySelectorAll('.order-card');
            orderCards.forEach(card => {
                const orderIdElement = card.querySelector('.order-id');
                if (orderIdElement && orderIdElement.textContent.includes(orderId)) {
                    card.style.display = 'none';
                }
            });

            // Show feedback
            showNotification(`Order removed from list`, 'success');
        }, 1000);
    }
}

function viewOrderDetails(orderId, deliveryType) {
    currentOrder = orderId;
    currentDeliveryType = deliveryType;

    // Reset photos
    capturedPhotos = { front: null, back: null, left: null, right: null };
    damageDescription = '';

    // Clear photo previews - reset to placeholder state
    ['Front', 'Back', 'Left', 'Right'].forEach(angle => {
        const previewContainer = document.getElementById(`photo${angle}`);
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="photo-preview-placeholder">
                    <div class="icon">📸</div>
                    <p>${angle}</p>
                </div>
            `;
        }

        // Also reset the file input
        const fileInput = document.getElementById(`photoInput${angle}`);
        if (fileInput) {
            fileInput.value = '';
        }
    });

    // Clear damage description
    const damageTextarea = document.getElementById('damageDescription');
    if (damageTextarea) {
        damageTextarea.value = '';
        document.getElementById('charCount').textContent = '0';
    }

    // Update UI based on delivery type
    if (deliveryType === 'RETURN_TO_OWNER') {
        // Show original condition section
        document.getElementById('originalConditionSection').style.display = 'block';

        // Update labels
        document.getElementById('photoSectionTitle').textContent = 'Current Condition (4 Photos)';
        document.getElementById('photoSectionDesc').textContent = 'Capture 4 angles of the item as you receive it from the borrower';
        document.getElementById('damageLabel').textContent = '📝 New Damage Description (if any)';

        // Load original photos and description from delivery 1
        loadOriginalCondition(orderId);
    } else {
        // Hide original condition section
        document.getElementById('originalConditionSection').style.display = 'none';

        // Update labels
        document.getElementById('photoSectionTitle').textContent = 'Item Documentation (4 Photos)';
        document.getElementById('photoSectionDesc').textContent = 'Capture 4 different angles of the item to document its condition';
        document.getElementById('damageLabel').textContent = '📝 Pre-existing Damage Description';
    }

    showPage('orderDetailsPage');

    // Initialize map (mock)
    initializeMap();
}


// ==================== 4-PHOTO CAPTURE SYSTEM ====================
function handle4PhotoCapture(event, photoAngle) {
    console.log('📸 Capture triggered for:', photoAngle);
    const file = event.target.files[0];

    if (!file) {
        console.log('❌ No file selected');
        return;
    }

    console.log('✓ File selected:', file.name, file.type, file.size, 'bytes');

    const reader = new FileReader();

    reader.onload = function (e) {
        const photoData = e.target.result;
        const angleCap = photoAngle.charAt(0).toUpperCase() + photoAngle.slice(1);
        const previewContainer = document.getElementById(`photo${angleCap}`);

        console.log('✓ Photo loaded, updating preview for:', angleCap);

        // Update preview
        if (previewContainer) {
            previewContainer.innerHTML = `<img src="${photoData}" alt="${photoAngle} view">`;
            console.log('✓ Preview updated successfully');
        } else {
            console.log('❌ Preview container not found for:', `photo${angleCap}`);
        }

        // Store photo data
        capturedPhotos[photoAngle] = photoData;
        console.log('✓ Photo stored in capturedPhotos');

        // Check if all photos captured
        const allCaptured = Object.values(capturedPhotos).every(photo => photo !== null);
        if (allCaptured) {
            showNotification(`All 4 photos captured! ✓ Now add damage description.`, 'success');
        } else {
            showNotification(`${angleCap} photo captured! 📸`, 'success');
        }
    };

    reader.onerror = function (e) {
        console.error('❌ Error reading file:', e);
        showNotification('Error capturing photo. Please try again.', 'error');
    };

    reader.readAsDataURL(file);
}

// Character counter for damage description
document.getElementById('damageDescription')?.addEventListener('input', function (e) {
    const charCount = e.target.value.length;
    document.getElementById('charCount').textContent = charCount;
    damageDescription = e.target.value;
});

// Load original condition for RETURN orders
function loadOriginalCondition(orderId) {
    console.log('🔍 Loading original condition for:', orderId);

    const userEmail = currentUser?.email || 'guest';

    // Try to load from localStorage with user-specific key
    let storedData = localStorage.getItem(`delivery_${userEmail}_${orderId}`);

    // If not found with current order ID, search for any delivery1 data for THIS USER
    if (!storedData) {
        console.log('❌ No data found for', orderId, '- searching user deliveries...');
        const allKeys = Object.keys(localStorage);
        for (const key of allKeys) {
            // Only search current user's deliveries
            if (key.startsWith(`delivery_${userEmail}_`)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.delivery1 && data.delivery1.photos) {
                        console.log('✓ Found delivery1 data in:', key);
                        storedData = localStorage.getItem(key);
                        break;
                    }
                } catch (e) {
                    console.error('Error parsing', key, e);
                }
            }
        }
    }

    if (storedData) {
        const data = JSON.parse(storedData);
        console.log('📦 Loaded delivery data:', data);

        if (data.delivery1 && data.delivery1.photos) {
            console.log('📸 Loading original photos from delivery1');

            // Load original photos
            ['front', 'back', 'left', 'right'].forEach(angle => {
                const photoData = data.delivery1.photos[angle];
                const angleCap = angle.charAt(0).toUpperCase() + angle.slice(1);
                const previewContainer = document.getElementById(`originalPhoto${angleCap}`);

                if (photoData && previewContainer) {
                    previewContainer.innerHTML = `<img src="${photoData}" alt="original ${angle}">`;
                    console.log(`✓ Loaded original ${angle} photo`);
                } else {
                    console.log(`❌ Could not load ${angle} photo`);
                }
            });

            // Load original damage description
            if (data.delivery1.damageDescription) {
                document.getElementById('originalDamageText').textContent = data.delivery1.damageDescription;
                console.log('✓ Loaded original damage description');
            } else {
                document.getElementById('originalDamageText').textContent = 'No damage notes from first delivery';
            }
        } else {
            console.log('❌ No delivery1 photos found in data');
            document.getElementById('originalDamageText').textContent = 'No damage notes from first delivery';
        }
    } else {
        console.log('⚠️ No Delivery 1 data found - First delivery not completed yet!');
        document.getElementById('originalDamageText').textContent = 'First delivery not completed yet. No comparison data available.';
        showNotification(' ⚠️ No original photos found. Complete Delivery 1 first!', 'info');
    }
}

// ==================== DELIVERY COMPLETION ====================
function completeDelivery() {
    // Validate all 4 photos captured
    const allPhotos = Object.values(capturedPhotos).every(photo => photo !== null);

    if (!allPhotos) {
        alert('⚠️ Please capture all 4 photos before completing delivery!');
        return;
    }

    // Confirm completion
    const confirmComplete = confirm('Have you documented the item condition and are ready to approve this delivery?');
    if (!confirmComplete) return;

    // Save delivery data
    saveDeliveryData();

    // Show processing
    showNotification('Processing delivery completion... ⏳', 'info');

    setTimeout(() => {
        // Show reward modal
        showRewardModal();

        // Update stats
        updateStats();
    }, 1500);
}

// Save delivery data to localStorage (ready for admin dashboard)
function saveDeliveryData() {
    const orderId = currentOrder;
    const userEmail = currentUser?.email || 'guest';
    // Make delivery data user-specific
    const deliveryKey = `delivery_${userEmail}_${orderId}`;

    // Get existing data or create new
    let existingData = localStorage.getItem(deliveryKey);
    let deliveryRecord = existingData ? JSON.parse(existingData) : {};

    // Create delivery entry
    const deliveryEntry = {
        partnerId: currentUser?.email || 'demo-partner',
        partnerName: currentUser?.name || 'Demo Partner',
        deliveryType: currentDeliveryType,
        timestamp: new Date().toISOString(),
        photos: {
            front: capturedPhotos.front,
            back: capturedPhotos.back,
            left: capturedPhotos.left,
            right: capturedPhotos.right
        },
        damageDescription: damageDescription || 'No damages reported',
        approved: true,
        completedAt: new Date().toISOString()
    };

    // Add to appropriate delivery slot
    if (currentDeliveryType === 'PICKUP_FROM_OWNER') {
        deliveryRecord.delivery1 = deliveryEntry;
        deliveryRecord.orderId = orderId;
        deliveryRecord.itemName = 'Item'; // Would come from order data
    } else if (currentDeliveryType === 'RETURN_TO_OWNER') {
        deliveryRecord.delivery2 = deliveryEntry;

        // Mark as ready for admin review
        deliveryRecord.readyForAdminReview = true;
    }

    // Save to localStorage
    localStorage.setItem(deliveryKey, JSON.stringify(deliveryRecord));

    // Also log to console for admin dashboard integration
    console.log('📊 Delivery Data Saved for Admin Dashboard:', deliveryRecord);

    showNotification('✓ Data saved successfully! Ready for admin review.', 'success');
}

// ==================== MAP FUNCTIONALITY ====================
function initializeMap() {
    // Simulate Google Maps loading
    const mapElement = document.getElementById('map');
    if (mapElement) {
        setTimeout(() => {
            // In a real app, you would initialize Google Maps here
            mapElement.innerHTML = `
        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; flex-direction: column; color: white;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
          <div style="font-size: 1.25rem; font-weight: 700;">Route Preview</div>
          <div style="font-size: 0.875rem; opacity: 0.9; margin-top: 0.5rem;">8.5 km · ETA 25 mins</div>
          <div style="margin-top: 1rem; font-size: 0.875rem;">
            <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px;">
              🚗 Clear traffic ahead
            </span>
          </div>
        </div>
      `;
        }, 500);
    }
}

function openGoogleMaps() {
    // Owner coordinates (Rajesh Kumar)
    const ownerLat = 12.9716;
    const ownerLng = 77.5946;

    // Customer coordinates (Priya Sharma)
    const customerLat = 12.9784;
    const customerLng = 77.6408;

    // Determine origin and destination based on delivery type
    let originLat, originLng, destLat, destLng;

    if (currentDeliveryType === 'PICKUP_FROM_OWNER') {
        // Going from Owner to Customer
        originLat = ownerLat;
        originLng = ownerLng;
        destLat = customerLat;
        destLng = customerLng;
    } else if (currentDeliveryType === 'RETURN_TO_OWNER') {
        // Going from Customer back to Owner (REVERSED)
        originLat = customerLat;
        originLng = customerLng;
        destLat = ownerLat;
        destLng = ownerLng;
    } else {
        // Default: Owner to Customer
        originLat = ownerLat;
        originLng = ownerLng;
        destLat = customerLat;
        destLng = customerLng;
    }

    // Open Google Maps with directions
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;

    window.open(mapsUrl, '_blank');
    showNotification('Opening Google Maps... 🗺️', 'info');
}

// ==================== RENTAL COMPARISON ====================
function toggleRentalComparison() {
    const comparisonSection = document.getElementById('rentalComparisonSection');
    if (comparisonSection.style.display === 'none') {
        comparisonSection.style.display = 'block';

        // Load before rental photo (mock - in real app this would come from backend)
        const beforeImage = document.getElementById('beforeRentalImage');
        if (!capturedPhotos.beforeRental) {
            // Simulate loading a previously captured photo
            setTimeout(() => {
                beforeImage.innerHTML = `
          <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.875rem; text-align: center; padding: 1rem;">
            <div>
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">✓</div>
              <div>Item condition verified</div>
            </div>
          </div>
        `;
            }, 300);
        }

        showNotification('Showing condition comparison 🔍', 'info');
    } else {
        comparisonSection.style.display = 'none';
    }
}

// ==================== REWARD MODAL ====================
function showRewardModal() {
    const modal = document.getElementById('rewardModal');
    modal.classList.add('active');

    // Play celebration animation
    createConfetti();
}

function closeRewardModal() {
    const modal = document.getElementById('rewardModal');
    modal.classList.remove('active');

    // Navigate back to dashboard
    setTimeout(() => {
        showPage('dashboardPage');
    }, 300);
}

// ==================== LOAD COMPLETED ORDERS ====================
function loadCompletedOrders() {
    const ordersList = document.getElementById('completedOrdersList');
    if (!ordersList) return;

    const userEmail = currentUser?.email || 'guest';

    // Get all delivery data from localStorage for THIS USER only
    const completedOrders = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Only load deliveries for current user
        if (key && key.startsWith(`delivery_${userEmail}_`)) {
            try {
                const deliveryData = JSON.parse(localStorage.getItem(key));
                if (deliveryData && (deliveryData.delivery1 || deliveryData.delivery2)) {
                    completedOrders.push(deliveryData);
                }
            } catch (e) {
                console.error('Error parsing delivery data:', e);
            }
        }
    }

    // Clear and rebuild the list
    if (completedOrders.length === 0) {
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                <p>No completed deliveries yet</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Complete your first delivery to see it here!</p>
            </div>
        `;
        document.getElementById('deliveryCount').textContent = '';
        return;
    }

    // Update count
    document.getElementById('deliveryCount').textContent = `${completedOrders.length} ${completedOrders.length === 1 ? 'delivery' : 'deliveries'}`;

    // Build order cards
    let ordersHTML = '';
    completedOrders.forEach((delivery) => {
        // Show delivery 1 if exists
        if (delivery.delivery1) {
            const d1 = delivery.delivery1;
            const itemIcon = delivery.orderId?.includes('2451') ? '📷' : (delivery.orderId?.includes('2450') ? '🎮' : '📦');
            const itemName = delivery.itemName || 'Item';
            const date = new Date(d1.timestamp).toLocaleString();

            ordersHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">📦 ${delivery.orderId || 'ORD-XXXX'}</span>
                        <span class="status-badge status-completed">Completed</span>
                    </div>
                    <div class="order-details">
                        <div class="detail-row">
                            <span class="detail-icon">${itemIcon}</span>
                            <div class="detail-content">
                                <div class="detail-value">${itemName} - Delivered Successfully</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                                    <span class="status-badge status-pickup-owner" style="padding: 0.25rem 0.5rem; font-size: 0.65rem;">Pickup from Owner</span>
                                </div>
                            </div>
                        </div>
                        <div class="detail-row">
                            <span class="detail-icon">💰</span>
                            <div class="detail-content">
                                <div class="detail-value">₹180 + 50 bonus points</div>
                            </div>
                        </div>
                        <div class="detail-row">
                            <span class="detail-icon">📅</span>
                            <div class="detail-content">
                                <div class="detail-value" style="font-size: 0.875rem; color: var(--text-secondary);">${date}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Show delivery 2 if exists
        if (delivery.delivery2) {
            const d2 = delivery.delivery2;
            const itemIcon = delivery.orderId?.includes('2451') ? '📷' : (delivery.orderId?.includes('2450') ? '🎮' : '📦');
            const itemName = delivery.itemName || 'Item';
            const date = new Date(d2.timestamp).toLocaleString();

            ordersHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">📦 ${delivery.orderId || 'ORD-XXXX'}-R</span>
                        <span class="status-badge status-completed">Completed</span>
                    </div>
                    <div class="order-details">
                        <div class="detail-row">
                            <span class="detail-icon">${itemIcon}</span>
                            <div class="detail-content">
                                <div class="detail-value">${itemName} - Returned Successfully</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                                    <span class="status-badge status-return-owner" style="padding: 0.25rem 0.5rem; font-size: 0.65rem;">Return to Owner</span>
                                </div>
                            </div>
                        </div>
                        <div class="detail-row">
                            <span class="detail-icon">💰</span>
                            <div class="detail-content">
                                <div class="detail-value">₹180 + 50 bonus points</div>
                            </div>
                        </div>
                        <div class="detail-row">
                            <span class="detail-icon">📅</span>
                            <div class="detail-content">
                                <div class="detail-value" style="font-size: 0.875rem; color: var(--text-secondary);">${date}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    ordersList.innerHTML = ordersHTML;
}

function updateStats() {
    // Update today's earnings
    const earningsElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (earningsElement) {
        const currentEarnings = parseInt(earningsElement.textContent.replace('₹', ''));
        earningsElement.textContent = `₹${currentEarnings + 180}`;
    }

    // Update completed count
    const completedElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (completedElement) {
        const currentCompleted = parseInt(completedElement.textContent);
        completedElement.textContent = currentCompleted + 1;
    }

    // Update active count
    const activeElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
    if (activeElement) {
        const currentActive = parseInt(activeElement.textContent);
        activeElement.textContent = Math.max(0, currentActive - 1);
    }

    // Update rewards
    const rewardsElement = document.querySelector('.stat-card:nth-child(4) .stat-value');
    if (rewardsElement) {
        const currentRewards = parseInt(rewardsElement.textContent.replace(' pts', ''));
        rewardsElement.textContent = `${currentRewards + 50} pts`;
    }
}

// ==================== CONFETTI ANIMATION ====================
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f5576c', '#00f2fe', '#fee140'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.zIndex = '10000';
        confetti.style.pointerEvents = 'none';

        document.body.appendChild(confetti);

        const duration = Math.random() * 3 + 2;
        const rotation = Math.random() * 360;
        const xMovement = (Math.random() - 0.5) * 200;

        confetti.animate([
            {
                transform: 'translateY(0) rotate(0deg) translateX(0)',
                opacity: 1
            },
            {
                transform: `translateY(100vh) rotate(${rotation}deg) translateX(${xMovement}px)`,
                opacity: 0
            }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        setTimeout(() => {
            confetti.remove();
        }, duration * 1000);
    }
}

// ==================== ISSUE REPORTING ====================
function reportIssue() {
    const issues = [
        'Item is damaged',
        'Item is different from description',
        'Customer is unavailable',
        'Address is incorrect',
        'Other issue'
    ];

    const issueList = issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n');
    const selectedIssue = prompt(`Report an issue:\n\n${issueList}\n\nEnter the number of the issue:`);

    if (selectedIssue && selectedIssue >= 1 && selectedIssue <= issues.length) {
        showNotification(`Issue reported: ${issues[selectedIssue - 1]} 📢`, 'warning');
        alert('Our support team will contact you shortly. You can continue with the delivery or cancel it.');
    }
}

// ==================== NOTIFICATIONS ====================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #781C2E;
    color: #F9F6EE;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(120, 28, 46, 0.4);
    z-index: 10001;
    font-weight: 600;
    max-width: 90%;
    text-align: center;
    animation: slideDown 0.3s ease;
  `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(-100px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(-100px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ==================== PROFILE UPDATE ====================
function updateProfileDisplay() {
    if (!currentUser) return;

    // Get profile elements
    const profileAvatar = document.querySelector('#profilePage .user-avatar');
    const profileName = document.querySelector('#profilePage .user-details h4');
    const profilePhone = document.querySelector('#profilePage .user-details p:last-child');

    if (profileAvatar && profileName && profilePhone) {
        // Update avatar with first letter of name
        const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
        profileAvatar.textContent = initial;

        // Update name
        profileName.textContent = currentUser.name || 'User';

        // Update contact info - show email or phone
        const contactInfo = currentUser.email || currentUser.phone || 'No contact info';
        profilePhone.textContent = contactInfo;
    }
}

// ==================== LOGOUT ====================
function logout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        showNotification('Logging out... 👋', 'info');

        // Clear current user
        currentUser = null;

        setTimeout(() => {
            showPage('loginPage');
            // Reset form
            document.getElementById('loginForm')?.reset();
        }, 1000);
    }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the app
    console.log('🚀 RentEx Delivery Partner App Initialized');

    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Close modal when clicking outside
    document.getElementById('rewardModal')?.addEventListener('click', function (e) {
        if (e.target === this) {
            closeRewardModal();
        }
    });

    // Prevent default form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
        });
    });
});

// ==================== SERVICE WORKER (PWA Support) ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // In a production app, you would register a service worker here
        console.log('💡 PWA support available');
    });
}

// ==================== DEMO MODE ====================
// Add a demo button for testing
window.demoCompleteDelivery = function () {
    // Auto-fill pickup photo
    capturedPhotos.pickup = 'demo';
    document.getElementById('pickupPhotoPreview').innerHTML = `
    <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1rem;">
      <div style="text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">📷</div>
        <div>Demo Photo Captured</div>
      </div>
    </div>
  `;

    // Complete delivery
    setTimeout(() => {
        completeDelivery();
    }, 500);
};

console.log('💡 Tip: Call demoCompleteDelivery() in console to test the delivery completion flow');

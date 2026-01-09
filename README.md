# 📦 Rental Delivery Partner App

A modern, feature-rich web application for delivery partners in a rental item marketplace. This app implements a comprehensive two-delivery system with photo documentation, damage tracking, and user management.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

### Core Features
- ✅ **Two-Delivery System**: Separate workflows for "Pickup from Owner" and "Return to Owner"
- 📸 **4-Photo Documentation**: Capture Front, Back, Left, and Right views of each item
- 📝 **Damage Tracking**: Document pre-existing and new damages with descriptions
- 🔍 **Condition Comparison**: Compare item condition between deliveries
- 👤 **User Authentication**: Secure login/signup with password visibility toggle
- 📦 **Order History**: User-specific delivery tracking
- 🎉 **Reward System**: Celebrate completed deliveries with animations
- 🗺️ **Google Maps Integration**: Easy navigation to pickup/delivery locations

### Technical Features
- 🎨 Modern dark theme with glassmorphism effects
- 📱 Fully responsive design
- ⚡ Pure Vanilla JavaScript (no frameworks)
- 💾 LocalStorage for data persistence (demo mode)
- 🔐 User-specific data isolation
- 🎭 Smooth animations and micro-interactions

## 📁 Project Structure

```
rental-delivery-app/
├── index.html          # Main application HTML
├── style.css           # All styles and themes
├── script.js           # Application logic
├── README.md           # This file
├── .gitignore          # Git ignore rules
└── docs/               # Documentation
    ├── TWO_DELIVERY_GUIDE.md
    ├── BUG_FIXES_COMPLETE.md
    └── PROJECT_SUMMARY.md
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/rental-delivery-app.git
cd rental-delivery-app
```

### 2. Open the App
Simply open `index.html` in your browser:
```bash
open index.html  # macOS
# or
start index.html # Windows
# or
xdg-open index.html # Linux
```

### 3. Login with Demo Credentials
```
Email: alex@example.com
Password: password123
```

## 📖 Usage

### Delivery 1: Pickup from Owner
1. **Accept Order** - Click accept on a "Pickup from Owner" order (green badge)
2. **Navigate** - Use Google Maps integration to reach owner location
3. **Document Item** - Capture 4 photos (front, back, left, right)
4. **Note Damages** - Describe any pre-existing damage (max 500 chars)
5. **Complete** - Approve and complete the delivery
6. **Deliver** - Take item to customer

### Delivery 2: Return to Owner
1. **Accept Return** - Click accept on a "Return to Owner" order (blue badge)
2. **View Original Condition** - See photos and notes from Delivery 1
3. **Navigate** - Go to customer location
4. **Compare** - Check item against original photos
5. **Document Current State** - Capture new 4 photos
6. **Note New Damages** - Describe any NEW damage found
7. **Complete** - System saves all 8 photos (4+4) for admin review
8. **Return** - Take item back to owner

## 🎯 Demo Accounts

```javascript
// Delivery Partners
alex@example.com / password123
sarah@example.com / password123
mike@example.com / password123

// You can also create new accounts via Sign Up
```

## 🔧 Configuration

### Test Data
The app comes with pre-configured test orders:
- **ORD-2451**: Professional Camera Kit (Pickup from Owner)
- **ORD-2450**: Professional Camera Kit (Return to Owner)

### LocalStorage Keys
Data is stored with user-specific keys:
```
delivery_{userEmail}_{orderId}
currentUser
```

## 📊 Data Structure

Each completed delivery stores:
```javascript
{
  orderId: "ORD-2451",
  itemName: "Professional Camera Kit",
  delivery1: {
    partnerId: "alex@example.com",
    partnerName: "Alex Morgan",
    deliveryType: "PICKUP_FROM_OWNER",
    timestamp: "2024-12-12T10:30:00Z",
    photos: {
      front: "data:image/jpeg;base64,...",
      back: "data:image/jpeg;base64,...",
      left: "data:image/jpeg;base64,...",
      right: "data:image/jpeg;base64,..."
    },
    damageDescription: "Small scratch on left side",
    approved: true
  },
  delivery2: {
    // Same structure for return delivery
  },
  readyForAdminReview: true
}
```

## 🐛 Known Issues & Fixes

All major bugs have been fixed:
- ✅ Reject order no longer logs out user
- ✅ Order history is now user-specific
- ✅ Password visibility toggle added
- ✅ Photo capture works on all deliveries
- ✅ Original condition photos load correctly

See [BUG_FIXES_COMPLETE.md](BUG_FIXES_COMPLETE.md) for details.

## 🎨 Customization

### Colors
Edit CSS variables in `style.css`:
```css
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --success: #10b981;
    /* ... more variables */
}
```

### Orders
Add more test orders in `index.html` (Dashboard section).

### Map Integration
Update Google Maps link in `script.js`:
```javascript
window.open('https://www.google.com/maps/search/?api=1&query=...');
```

## 🚢 Deployment

### Deploy to GitHub Pages
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

Then enable GitHub Pages in repository settings.

### Deploy to Netlify
1. Drag and drop the folder to Netlify
2. Or connect your GitHub repo
3. Build command: (none)
4. Publish directory: ./

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE11 (limited support)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Mohan Krishna Kotha**
- GitHub: [@mohan-krishna-kotha](https://github.com/mohan-krishna-kotha)

## 🙏 Acknowledgments

- Built with pure HTML, CSS, and JavaScript
- No external dependencies
- Inspired by modern delivery apps
- Designed for rental marketplace delivery partners

## 📞 Support

For support, email: [mohankrishnan@gmail.com]

## 🗺️ Roadmap

- [ ] Add backend API integration
- [ ] Implement real-time order updates
- [ ] Add push notifications
- [ ] Create admin dashboard
- [ ] Implement payment processing
- [ ] Add multi-language support
- [ ] Mobile app version (React Native)

---

⭐ **Star this repo if you find it helpful!** ⭐

# LinkedIn Finder Chrome Extension

A powerful Chrome extension that highlights keywords on LinkedIn pages to help you quickly identify relevant profiles, job postings, and content that match your search criteria.

![LinkedIn Finder Demo](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome Extension](https://img.shields.io/badge/chrome-extension-brightgreen.svg)

## 🚀 Features

- **Smart Keyword Highlighting**: Add custom keywords that will be automatically highlighted on LinkedIn pages
- **Real-time Updates**: Keywords are highlighted dynamically as you navigate through LinkedIn
- **Persistent Storage**: Your keywords are saved across browser sessions
- **Performance Optimized**: Uses efficient DOM observation and debounced highlighting
- **Clean UI**: Modern, intuitive popup interface for managing keywords
- **Case Insensitive**: Finds keywords regardless of case

## 📸 Screenshots

![Add Keywords](https://raw.githubusercontent.com/miguelx97/linkedin-finder-chrome-ext/refs/heads/main/resources/cover.jpeg)

## 🛠️ Installation

### From Chrome Web Store

_[Coming Soon - Will be available on Chrome Web Store]_

### Manual Installation (Developer Mode)

1. **Clone the repository**

   ```bash
   git clone https://github.com/miguelx97/linkedin-finder-chrome-ext.git
   cd linkedin-finder-chrome-ext
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build the extension**

   ```bash
   pnpm build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder

## 🔧 Development

### Prerequisites

- Node.js (v16 or higher)
- pnpm
- Chrome browser

### Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/miguelx97/linkedin-finder-chrome-ext.git
   cd linkedin-finder-chrome-ext
   pnpm install
   ```

2. **Development build**

   ```bash
   pnpm dev
   ```

3. **Build for production**
   ```bash
   pnpm build
   ```

### Project Structure

```
linkedin-finder-chrome-ext/
├── src/
│   ├── components/ui/       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── chip.tsx
│   │   └── input.tsx
│   ├── pages/
│   │   └── App.tsx         # Main popup interface
│   ├── services/
│   │   └── highlightService.ts  # Core highlighting logic
│   ├── global/
│   │   └── constants.ts    # Application constants
│   ├── content-script.ts   # Content script entry point
│   └── main.tsx           # React app entry point
├── public/
│   ├── manifest.json      # Chrome extension manifest
│   ├── images/           # Extension icons
│   └── highlight-styles.css  # Highlighting styles
└── dist/                 # Built extension files
```

## 💡 How It Works

1. **Keyword Management**: Use the extension popup to add/remove keywords you want to highlight
2. **Auto-Highlighting**: When you visit LinkedIn, the extension automatically scans and highlights your keywords
3. **Dynamic Updates**: As you navigate or as new content loads, highlighting updates in real-time
4. **Smart Detection**: Uses mutation observers to detect DOM changes and re-highlight new content

## 🎯 Usage

1. **Add Keywords**: Click the extension icon and add keywords you want to track
2. **Browse LinkedIn**: Navigate to any LinkedIn page
3. **See Highlights**: Your keywords will be highlighted with a yellow background
4. **Manage Keywords**: Remove keywords by clicking the 'X' on each chip in the popup

### Example Use Cases

- **Recruiters**: Highlight skills like "React", "Python", "Machine Learning"
- **Job Seekers**: Highlight company names, job titles, or technologies
- **Sales**: Highlight industry terms, company types, or decision-maker titles
- **Networking**: Highlight interests, locations, or specific expertise areas

## 🔒 Permissions

The extension requires the following permissions:

- **Storage**: To save your keywords across browser sessions
- **LinkedIn Access**: To highlight keywords on LinkedIn pages (`https://www.linkedin.com/*`)

## 🏗️ Technical Details

### Built With

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Chrome Extension API** - Browser integration

### Key Components

- **HighlightService**: Core service that handles keyword highlighting using regex patterns and DOM manipulation
- **Storage Management**: Uses Chrome's sync storage for cross-device keyword synchronization
- **Performance Optimization**: Implements debounced highlighting to prevent performance issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Write descriptive commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/miguelx97/linkedin-finder-chrome-ext/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide as much detail as possible, including:
   - Chrome version
   - Extension version
   - Steps to reproduce
   - Expected vs actual behavior

## 👥 Authors

- **Miguel Martin** - _Initial work_ - [YourGitHub](https://github.com/miguelx97)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better LinkedIn navigation
- Thanks to the Chrome Extensions API documentation

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ for the LinkedIn community

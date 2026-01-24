# Link Building Automator 🚀

**Link Building Automator** is a high-performance Chrome Extension designed to supercharge the link-building workflow for SEO professionals. It automates repetitive tasks like form filling, profile management, and site navigation, enabling "god-tier" efficiency when managing large-scale outreach or backlink campaigns.

## 🚀 Key Features

-   **Smart Form Filler**: Uses a hybrid detection engine to intelligently identify and fill form fields like usernames, emails, websites, and custom categories across various platforms (e.g., WordPress, directories).
    
-   **Profile Hub**: Allows users to save and switch between multiple "Current Flat Data" profiles, making it instant to populate forms with specific campaign information.
    
-   **Intelligent Quad-Click & Long-Press Menus**: Features unique interactive triggers, such as a **Ctrl + X Long Press** to toggle the Smart Suggestion Menu and specialized click patterns for rapid automation.
    
-   **Cross-Tool Integration**: Includes a built-in "Ping-Pong" switcher to toggle instantly between your current work tab and external tools like **FakeMail** or a **Multi-Format Link Converter**.
    
-   **Watchtower & Toasts**: Provides real-time visual feedback via animated banners and toast notifications to confirm automation states and successful actions.
    
-   **XLSX Support**: Integrated with a mini XLSX engine to handle data exports and imports directly within the extension.
    

## 🛠️ Tech Stack

-   **Frontend**: HTML5, CSS3, and Vanilla JavaScript for high-speed content script execution.
    
-   **Extension Core**: Manifest V3, utilizing background workers for state management and tab navigation.
    
-   **Storage**: Chrome Local Storage for persistent profile data and master switch states.
    
-   **Utilities**:
    
    -   **xlsx.mini.min.js**: For processing spreadsheet data locally.
        
    -   **DOMParser**: For real-time analysis of pasted HTML and link structures.
        

## 📁 Project Structure

Plaintext

```
├── background.js     # Tab tracking and command switching logic [cite: 12651]
├── content.js        # Core automation engine and form detection 
├── content.css       # Styles for suggestion menus and UI banners [cite: 12667]
├── popup.html/js     # Profile management and master configuration UI [cite: 12645]
├── manifest.json     # Extension permissions and entry points [cite: 12645]
└── xlsx.mini.min.js  # Excel processing utility 

```

## ⌨️ Shortcuts & Commands

-   **Ctrl + X (Long Press)**: Toggle the Smart Suggestion Menu.
    
-   **Alt + Double Click**: Rapidly switch to and refresh **FakeMail**.
    
-   **Shift + Alt + Double Click**: Toggle between the active tab and the **Link Converter**.
    

----------

_Created to transform manual link building into a streamlined, automated powerhouse._

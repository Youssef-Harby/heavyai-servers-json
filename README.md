# HeavyAI Servers JSON Configurator

A modern web interface for editing HeavyAI servers configuration JSON files with support for:
- Feature flags management
- SQL notebook cards configuration
- Mapbox custom styles editing
- General server settings
- Custom branding and UI configuration

## Features

- 🎨 Modern UI with Tailwind CSS
- 📝 Advanced JSON editing with Monaco Editor
- 💾 Auto-save and version tracking
- 🔍 Search and filter capabilities
- 🎯 Specialized editors for complex fields

## About HeavyAI Servers JSON

The servers.json file is used to define the default connection behavior in Heavy Immerse. It allows you to configure:

- Database connection settings (host, port, username, password)
- Default UI theme and appearance
- Feature flags for enabling/disabling functionality
- Custom branding elements (logos, colors, text)
- Mapbox custom styles for geo charts
- UI visibility controls

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Configuration Format

The editor supports the HeavyAI servers.json configuration format with special handling for:

- `feature_flags`: Controls UI behavior and feature availability
- `customStyles`: Branding elements like logos, colors, and text
- `mapboxCustomStyles`: Custom basemap styles for geo charts
- `immerse_ui_keys`: Controls which UI elements are visible

## Development

### Project Structure
```
heavyai-config-editor/
├── src/
│   ├── components/      # Vue components
│   ├── stores/          # Pinia stores
│   ├── types/           # TypeScript types
│   ├── utils/          # Utility functions
│   └── views/          # Page components
├── public/             # Static assets
└── ...config files
```

### Key Components

- **NotebookCardsEditor**: Manages SQL notebook cards with database-specific questions
- **MapboxStylesEditor**: Handles both URL and JSON-based Mapbox styles
- **FeatureFlagsEditor**: Manages various types of feature flags
- **JsonViewer**: Monaco-based JSON editor with syntax highlighting

## Documentation

For more information about the servers.json configuration options, refer to the [HeavyAI documentation](https://docs.heavyai.com/).

## License

MIT

export interface NotebookCard {
  text: string;
  dataSources: string[];
}

export interface NotebookCards {
  [database: string]: NotebookCard[];
}

export interface CustomStyle {
  title?: string;
  logoURL?: string;
  darkThemeLogoURL?: string;
}

export interface MapLayer {
  id: string;
  type: string;
  source: string;
  minzoom?: number;
  maxzoom?: number;
}

export interface MapSource {
  type: string;
  tiles?: string[];
  tileSize?: number;
}

export interface MapboxStyleValue {
  version?: number;
  sources?: Record<string, MapSource>;
  layers?: MapLayer[];
}

export interface MapboxCustomStyle {
  label: string;
  value: MapboxStyleValue | string;
}

export interface FeatureFlags {
  [key: string]: boolean | number | string | string[];
}

export interface ServerConfig {
  username: string;
  database: string;
  password: string;
  enableJupyter: boolean;
  feature_flags: FeatureFlags;
  customStyles: CustomStyle;
  mapboxCustomStyles: MapboxCustomStyle[];
}

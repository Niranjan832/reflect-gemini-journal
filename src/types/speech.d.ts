
interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// Add ModelType interface extension to include backend property
// This is to accommodate the SystemPromptConfig component that expects this property
declare namespace Models {
  interface ModelType {
    backend?: string;
  }
}

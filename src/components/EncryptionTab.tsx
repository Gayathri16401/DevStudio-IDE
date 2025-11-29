import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, Copy, Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CryptoJS from "crypto-js";

const EncryptionTab = () => {
  const [message, setMessage] = useState("");
  const [key, setKey] = useState(""); // Session-only storage - no persistence
  const [output, setOutput] = useState("");
  const [errorMessage, setErrorMessage] = useState("COMP_EMSG");
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [outputFocused, setOutputFocused] = useState(false);
  const [keyStrength, setKeyStrength] = useState<"weak" | "medium" | "strong" | null>(null);

  // Validate key strength
  const validateKeyStrength = (keyValue: string) => {
    if (!keyValue) {
      setKeyStrength(null);
      return;
    }
    
    if (keyValue.length < 8) {
      setKeyStrength("weak");
    } else if (keyValue.length < 16 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(keyValue)) {
      setKeyStrength("medium");
    } else {
      setKeyStrength("strong");
    }
  };

  const handleKeyChange = (value: string) => {
    setKey(value);
    validateKeyStrength(value);
  };

  /**
   * AES Encryption using CryptoJS
   */
  const encrypt = (text: string, secretKey: string) => {
    if (!secretKey) return text;
    try {
      const res = CryptoJS.AES.encrypt(text, secretKey).toString();
      return res;
    } catch (error) {
      console.error("Encryption error:", error);
      return text;
    }
  };

  /**
   * AES Decryption using CryptoJS
   */
  const decrypt = (encryptedText: string, secretKey: string) => {
    if (!secretKey) return { result: encryptedText, error: null };
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
      const res = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!res) {
        return { result: "", error: "Invalid encrypted data or wrong key" };
      }
      return { result: res, error: null };
    } catch (error) {
      console.error("Decryption error:", error);
      return { result: "", error: "Invalid encrypted data or wrong key" };
    }
  };

  const handleEncrypt = () => {
    if (!message || !key) {
      setErrorMessage("Error: Missing data or key");
      return;
    }
    if (keyStrength === "weak") {
      setErrorMessage("Warning: Weak key detected - use stronger key");
      return;
    }
    const encrypted = encrypt(message, key);
    setOutput(encrypted);
    setErrorMessage("COMP_EMSG");
  };

  const handleDecrypt = () => {
    if (!message || !key) {
      setErrorMessage("Error: Missing data or key");
      return;
    }
    if (keyStrength === "weak") {
      setErrorMessage("Warning: Weak key detected - use stronger key");
      return;
    }
    const { result, error } = decrypt(message, key);
    if (error) {
      setOutput("");
      setErrorMessage(error);
    } else {
      setOutput(result);
      setErrorMessage("COMP_EMSG");
    }
  };

  const handleClear = () => {
    setMessage("");
    setOutput("");
    setErrorMessage("COMP_EMSG");
  };

  const handleClearAll = () => {
    setMessage("");
    setKey("");
    setOutput("");
    setErrorMessage("COMP_EMSG");
    setKeyStrength(null);
  };

  const getKeyStrengthColor = () => {
    switch (keyStrength) {
      case "weak": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "strong": return "text-green-400";
      default: return "text-slate-400";
    }
  };

  const getKeyStrengthText = () => {
    switch (keyStrength) {
      case "weak": return "Weak (use 8+ chars, mixed case, numbers)";
      case "medium": return "Medium (add special characters for better security)";
      case "strong": return "Strong";
      default: return "Enter encryption key";
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  return (
    <div className="h-full bg-slate-900 p-3 sm:p-6 overflow-auto flex flex-col">
      <div className="flex items-center space-x-2 mb-3 sm:mb-4">
        <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
        <h2 className="text-xs sm:text-sm font-semibold text-slate-100">Data Processing Tools</h2>
      </div>

      {/* Security Warning */}
      <Alert className="mb-3 sm:mb-4 bg-amber-900/20 border-amber-600/30">
        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
        <AlertDescription className="text-amber-200 text-[10px] sm:text-xs">
          <strong>Security Notice:</strong> Keys are stored in memory only and will be cleared when you refresh the page.
          Use strong passwords (16+ characters, mixed case, numbers, symbols).
        </AlertDescription>
      </Alert>

      {/* Main Layout: Input | Output */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* Left: Input Section */}
          <div className="flex flex-col h-full space-y-2 sm:space-y-3 min-h-[300px] lg:min-h-0">
            <div className="flex-1 flex flex-col space-y-2">
              <Label className="text-slate-300 text-[10px] sm:text-xs">Paste (or write) text content</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Enter data to encrypt..."
                className={`bg-slate-700 border-slate-600 text-slate-100 flex-1 text-[10px] sm:text-xs resize-none transition-all min-h-[120px] ${
                  !inputFocused && message ? 'blur-sm' : ''
                }`}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] sm:text-xs ${getKeyStrengthColor()}`}>
                  {getKeyStrengthText()}
                </span>
              </div>
              <Input
                type="password"
                value={key}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="Enter encryption key (16+ chars)"
                className={`bg-slate-700 border-slate-600 text-slate-100 h-8 sm:h-10 text-[10px] sm:text-xs font-mono ${
                  keyStrength === "weak" ? "border-red-500" :
                  keyStrength === "medium" ? "border-yellow-500" :
                  keyStrength === "strong" ? "border-green-500" : ""
                }`}
              />
            </div>
            <div className="grid grid-cols-4 gap-1 sm:gap-2">
              <Button
                onClick={handleEncrypt}
                disabled={!key || !message || keyStrength === "weak"}
                className="bg-blue-600 hover:bg-blue-700 text-white h-7 sm:h-8 text-[10px] sm:text-xs w-full disabled:opacity-50"
              >
                ENC
              </Button>
              <Button
                onClick={handleDecrypt}
                disabled={!key || !message || keyStrength === "weak"}
                className="bg-blue-600 hover:bg-blue-700 text-white h-7 sm:h-8 text-[10px] sm:text-xs w-full disabled:opacity-50"
              >
                DEC
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600 h-7 sm:h-8 text-[10px] sm:text-xs w-full"
              >
                CLR
              </Button>
              <Button
                onClick={handleClearAll}
                variant="outline"
                className="bg-red-700 hover:bg-red-600 text-red-200 border-red-600 h-7 sm:h-8 text-[10px] sm:text-xs w-full"
              >
                ALL
              </Button>
            </div>
          </div>

          {/* Right: Output Section */}
          <div className="flex flex-col h-full space-y-2 sm:space-y-3 min-h-[300px] lg:min-h-0">
            <div className="flex-1 flex flex-col space-y-2">
              <Label className="text-slate-300 text-[10px] sm:text-xs">Computational Result</Label>
              <Textarea
                value={output}
                readOnly
                onFocus={() => setOutputFocused(true)}
                onBlur={() => setOutputFocused(false)}
                placeholder=""
                className={`bg-slate-700 border-slate-600 text-green-400 font-mono text-[10px] sm:text-[11px] flex-1 resize-none transition-all min-h-[120px] ${
                  !outputFocused && output ? 'blur-sm' : ''
                }`}
              />
            </div>
            <div className="space-y-2">
              <Input
                value={errorMessage}
                readOnly
                className={`bg-slate-700 border-slate-600 h-8 sm:h-10 text-[10px] sm:text-xs font-mono ${
                  errorMessage === "COMP_EMSG" ? "text-slate-400" : "text-red-400"
                }`}
              />
            </div>
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              <div></div>
              <Button
                onClick={copyOutput}
                disabled={!output}
                className="bg-blue-600 hover:bg-blue-700 text-white h-7 sm:h-8 text-[10px] sm:text-xs w-full"
              >
                {copiedOutput ? 'COPIED!' : 'COPY'}
              </Button>
              <Button
                onClick={() => setOutput("")}
                disabled={!output}
                className="bg-blue-600 hover:bg-blue-700 text-white h-7 sm:h-8 text-[10px] sm:text-xs w-full"
              >
                CLR
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default EncryptionTab;

// Made with Bob

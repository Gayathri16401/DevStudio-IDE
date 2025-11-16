import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, Copy, Shield } from "lucide-react";
import CryptoJS from "crypto-js";

const EncryptionTab = () => {
  const [message, setMessage] = useState("");
  const [key, setKey] = useState("");
  const [output, setOutput] = useState("");
  const [errorMessage, setErrorMessage] = useState("COMP_EMSG");
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [outputFocused, setOutputFocused] = useState(false);

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
    const encrypted = encrypt(message, key);
    setOutput(encrypted);
    setErrorMessage("COMP_EMSG");
  };

  const handleDecrypt = () => {
    if (!message || !key) {
      setErrorMessage("Error: Missing data or key");
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

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  return (
    <div className="h-full bg-slate-900 p-6 overflow-auto flex flex-col">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-4 h-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-100">Data Processing Tools</h2>
      </div>

      {/* Main Layout: Input | Output */}
      <div className="flex-1 grid grid-cols-2 gap-6">
          {/* Left: Input Section */}
          <div className="flex flex-col h-full space-y-3">
            <div className="flex-1 flex flex-col space-y-2">
              <Label className="text-slate-300 text-xs">Paste (or write) text content</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Enter data to encrypt..."
                className={`bg-slate-700 border-slate-600 text-slate-100 flex-1 text-xs resize-none transition-all ${
                  !inputFocused && message ? 'blur-sm' : ''
                }`}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••••••••••••••••••••••"
                className="bg-slate-700 border-slate-600 text-slate-100 h-10 text-xs font-mono"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={handleEncrypt}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs w-full"
              >
                ENC
              </Button>
              <Button
                onClick={handleDecrypt}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs w-full"
              >
                DEC
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600 h-8 text-xs w-full"
              >
                CLR
              </Button>
            </div>
          </div>

          {/* Right: Output Section */}
          <div className="flex flex-col h-full space-y-3">
            <div className="flex-1 flex flex-col space-y-2">
              <Label className="text-slate-300 text-xs">Computational Result</Label>
              <Textarea
                value={output}
                readOnly
                onFocus={() => setOutputFocused(true)}
                onBlur={() => setOutputFocused(false)}
                placeholder=""
                className={`bg-slate-700 border-slate-600 text-green-400 font-mono text-[11px] flex-1 resize-none transition-all ${
                  !outputFocused && output ? 'blur-sm' : ''
                }`}
              />
            </div>
            <div className="space-y-2">
              <Input
                value={errorMessage}
                readOnly
                className={`bg-slate-700 border-slate-600 h-10 text-xs font-mono ${
                  errorMessage === "COMP_EMSG" ? "text-slate-400" : "text-red-400"
                }`}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div></div>
              <Button
                onClick={copyOutput}
                disabled={!output}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs w-full"
              >
                {copiedOutput ? 'COPIED!' : 'COPY'}
              </Button>
              <Button
                onClick={() => setOutput("")}
                disabled={!output}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs w-full"
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

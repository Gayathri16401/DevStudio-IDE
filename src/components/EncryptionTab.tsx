import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [resetTimer, setResetTimer] = useState<number>(0); // Timer in minutes (0-60)
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0); // Remaining seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    stopTimer();
  };

  const startTimer = () => {
    if (resetTimer > 0 && resetTimer <= 60) {
      setRemainingTime(resetTimer * 60); // Convert minutes to seconds
      setIsTimerActive(true);
    }
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    setRemainingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (isTimerActive && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            // Timer finished - clear all data
            handleClearAll();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (remainingTime === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsTimerActive(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive, remainingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  return (
    <div className="h-full bg-slate-900 p-3 sm:p-6 overflow-auto flex flex-col">
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
                placeholder="Enter data..."
                className={`bg-slate-700 border-slate-600 text-slate-100 flex-1 text-[10px] sm:text-xs resize-none transition-all min-h-[120px] ${
                  !inputFocused && message ? 'blur-sm' : ''
                }`}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                value={key}
                onChange={(e) => handleKeyChange(e.target.value)}
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
              <div className="flex items-center justify-center gap-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 h-7 sm:h-8">
                <Label className="text-slate-300 text-[10px] sm:text-xs whitespace-nowrap">
                  <span className="sm:hidden">RST</span>
                  <span className="hidden sm:inline">RST Timer (0-60 mins)</span>
                </Label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={resetTimer}
                  onChange={(e) => {
                    const value = Math.min(60, Math.max(0, parseInt(e.target.value) || 0));
                    setResetTimer(value);
                    // Auto-start timer when value is set
                    if (value > 0) {
                      setRemainingTime(value * 60);
                      setIsTimerActive(true);
                    } else {
                      stopTimer();
                    }
                  }}
                  className="bg-slate-800 border border-slate-500 rounded text-slate-100 h-5 sm:h-6 text-[10px] sm:text-xs w-8 sm:w-10 px-1 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {isTimerActive && remainingTime > 0 && (
                  <span className="text-green-400 text-[10px] sm:text-xs font-mono whitespace-nowrap">
                    {formatTime(remainingTime)}
                  </span>
                )}
              </div>
              <Button
                onClick={copyOutput}
                disabled={!output}
                className="bg-blue-600 hover:bg-blue-700 text-white h-7 sm:h-8 text-[10px] sm:text-xs w-full"
              >
                {copiedOutput ? 'COPIED!' : 'CPY'}
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

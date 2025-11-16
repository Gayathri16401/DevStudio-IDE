
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Unlock, Copy, Key, Shield } from "lucide-react";
import CryptoJS from "crypto-js";

const EncryptionTab = () => {
  const [message, setMessage] = useState("");
  const [key, setKey] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [encryptInput, setEncryptInput] = useState("");
  const [copiedEncrypted, setCopiedEncrypted] = useState(false);
  const [copiedDecrypted, setCopiedDecrypted] = useState(false);

  /**
   * AES Encryption using CryptoJS
   * Algorithm: AES (Advanced Encryption Standard)
   * Mode: CBC (Cipher Block Chaining) - CryptoJS default
   * Padding: PKCS7 - CryptoJS default
   * Key Derivation: OpenSSL-compatible (EVP_BytesToKey) with MD5 hashing
   * Output Format: Base64 encoded string
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
   * Decrypts the Base64 encoded ciphertext using the same secret key
   */
  const decrypt = (encryptedText: string, secretKey: string) => {
    if (!secretKey) return encryptedText;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
      const res = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!res) {
        return "Invalid encrypted data or wrong key";
      }
      return res;
    } catch (error) {
      console.error("Decryption error:", error);
      return "Invalid encrypted data or wrong key";
    }
  };

  const handleEncrypt = () => {
    if (!message || !key) {
      return;
    }
    const encrypted = encrypt(message, key);
    setEncryptedMessage(encrypted);
  };

  const handleDecrypt = () => {
    if (!encryptInput || !key) {
      return;
    }
    const decrypted = decrypt(encryptInput, key);
    setDecryptedMessage(decrypted);
  };

  const copyToClipboard = (text: string, type: 'encrypted' | 'decrypted') => {
    navigator.clipboard.writeText(text);
    if (type === 'encrypted') {
      setCopiedEncrypted(true);
      setTimeout(() => setCopiedEncrypted(false), 2000);
    } else {
      setCopiedDecrypted(true);
      setTimeout(() => setCopiedDecrypted(false), 2000);
    }
  };

  return (
    <div className="h-full bg-slate-900 p-3 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-100">Data Processing Tools</h2>
        </div>

        {/* Encryption Key */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-slate-100 text-sm">
              <Key className="w-3.5 h-3.5" />
              <span>Encryption Key</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Label htmlFor="key" className="text-slate-300 text-xs">Secret Key</Label>
              <Input
                id="key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your secret key..."
                className="bg-slate-700 border-slate-600 text-slate-100 h-8 text-xs"
              />
              <p className="text-[10px] text-slate-400">
                Use the same key for encryption and decryption. Keep it secure!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Encryption Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-slate-100 text-sm">
              <Lock className="w-3.5 h-3.5" />
              <span>Paste or Enter Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-1.5">
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter data to encrypt..."
                className="bg-slate-700 border-slate-600 text-slate-100 min-h-[80px] text-xs"
              />
            </div>
            
            <Button
              onClick={handleEncrypt}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
            >
              <Lock className="w-3 h-3 mr-1.5" />
              Manipulate Data
            </Button>

            {encryptedMessage && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300 text-xs">Encrypted Output</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(encryptedMessage, 'encrypted')}
                    className="text-slate-400 hover:text-white hover:bg-slate-600 h-6 px-2"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    <span className="text-[10px]">{copiedEncrypted ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <Textarea
                  value={encryptedMessage}
                  readOnly
                  className="bg-slate-700 border-slate-600 text-green-400 font-mono text-[11px] min-h-[70px]"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decryption Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-slate-100 text-sm">
              <Unlock className="w-3.5 h-3.5" />
              <span>Computed Output</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-1.5">
              <Label htmlFor="encryptInput" className="text-slate-300 text-xs">Encrypted Data</Label>
              <Textarea
                id="encryptInput"
                value={encryptInput}
                onChange={(e) => setEncryptInput(e.target.value)}
                placeholder="Paste encrypted data here..."
                className="bg-slate-700 border-slate-600 text-slate-100 font-mono text-[11px] min-h-[80px]"
              />
            </div>
            
            <Button
              onClick={handleDecrypt}
              className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
            >
              <Unlock className="w-3 h-3 mr-1.5" />
              Convert Data
            </Button>

            {decryptedMessage && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300 text-xs">Decrypted Data</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(decryptedMessage, 'decrypted')}
                    className="text-slate-400 hover:text-white hover:bg-slate-600 h-6 px-2"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    <span className="text-[10px]">{copiedDecrypted ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <Textarea
                  value={decryptedMessage}
                  readOnly
                  className="bg-slate-700 border-slate-600 text-yellow-400 min-h-[70px] text-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EncryptionTab;

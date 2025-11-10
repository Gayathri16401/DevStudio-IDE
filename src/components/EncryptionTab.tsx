
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Unlock, Copy, Key, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EncryptionTab = () => {
  const [message, setMessage] = useState("");
  const [key, setKey] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [encryptInput, setEncryptInput] = useState("");
  const { toast } = useToast();

  // Simple XOR encryption for demonstration
  const encrypt = (text: string, secretKey: string) => {
    if (!secretKey) return text;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length)
      );
    }
    return btoa(result); // Base64 encode
  };

  const decrypt = (encryptedText: string, secretKey: string) => {
    if (!secretKey) return encryptedText;
    try {
      const decoded = atob(encryptedText); // Base64 decode
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length)
        );
      }
      return result;
    } catch {
      return "Invalid encrypted message";
    }
  };

  const handleEncrypt = () => {
    if (!message || !key) {
      toast({
        title: "Missing Information",
        description: "Please enter both message and encryption key",
        variant: "destructive",
      });
      return;
    }
    const encrypted = encrypt(message, key);
    setEncryptedMessage(encrypted);
    toast({
      title: "Encryption Successful",
      description: "Message has been encrypted",
    });
  };

  const handleDecrypt = () => {
    if (!encryptInput || !key) {
      toast({
        title: "Missing Information", 
        description: "Please enter both encrypted message and decryption key",
        variant: "destructive",
      });
      return;
    }
    const decrypted = decrypt(encryptInput, key);
    setDecryptedMessage(decrypted);
    toast({
      title: "Decryption Successful",
      description: "Message has been decrypted",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  return (
    <div className="h-full bg-slate-900 p-4 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-100">Data Processing Tools</h2>
        </div>

        {/* Encryption Key */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-100">
              <Key className="w-4 h-4" />
              <span>Encryption Key</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="key" className="text-slate-300">Secret Key</Label>
              <Input
                id="key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your secret key..."
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
              <p className="text-xs text-slate-400">
                Use the same key for encryption and decryption. Keep it secure!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Encryption Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-100">
              <Lock className="w-4 h-4" />
              <span>Paste or Enter Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message to encrypt..."
                className="bg-slate-700 border-slate-600 text-slate-100 min-h-[100px]"
              />
            </div>
            
            <Button 
              onClick={handleEncrypt}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Lock className="w-4 h-4 mr-2" />
              Manipulate Data
            </Button>

            {encryptedMessage && (
              <div className="space-y-2">
                
                <div className="relative">
                  <Textarea
                    value={encryptedMessage}
                    readOnly
                    className="bg-slate-700 border-slate-600 text-green-400 font-mono text-sm min-h-[80px]"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(encryptedMessage)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decryption Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-100">
              <Unlock className="w-4 h-4" />
              <span>Computed Output</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="encryptInput" className="text-slate-300">Encrypted Message</Label>
              <Textarea
                id="encryptInput"
                value={encryptInput}
                onChange={(e) => setEncryptInput(e.target.value)}
                placeholder="Paste encrypted message here..."
                className="bg-slate-700 border-slate-600 text-slate-100 font-mono text-sm min-h-[100px]"
              />
            </div>
            
            <Button 
              onClick={handleDecrypt}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Convert Data
            </Button>

            {decryptedMessage && (
              <div className="space-y-2">
                <Label className="text-slate-300">Decrypted Message</Label>
                <div className="relative">
                  <Textarea
                    value={decryptedMessage}
                    readOnly
                    className="bg-slate-700 border-slate-600 text-yellow-400 min-h-[80px]"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(decryptedMessage)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EncryptionTab;

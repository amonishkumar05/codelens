import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";
import Pixelate from "./Pixelate";


interface CodeInputProps {
  onSubmitCode: (code: string) => void;
  isLoading: boolean;
}

const CodeInput = ({ onSubmitCode, isLoading }: CodeInputProps) => {
  const [code, setCode] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = () => {
    if (code.trim()) {
      onSubmitCode(code);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-4"
    >
      <motion.div
        className={`relative border-2 border-dashed rounded-lg backdrop-blur-sm ${isDragging ? 'border-primary' : 'border-border/50'
          } transition-colors overflow-hidden`}
        animate={{
          borderColor: isDragging ? 'hsl(var(--primary))' : 'hsl(var(--border))',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="relative">
          <Textarea
            className="min-h-[300px] font-mono text-sm bg-secondary/30 backdrop-blur-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {!code && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <p className="text-muted-foreground text-center">
                Paste your code here or drag and drop a file
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.rb,.go,.php,.html,.css"
          />
          <Button variant="outline" className="w-full gap-2 bg-secondary/50 backdrop-blur-sm">
            <Upload size={16} /> Upload File
          </Button>
        </div>

        <Button
          onClick={() => code.trim() && onSubmitCode(code)}
          className="flex-1 bg-[#8872df] hover:bg-[#6e58c6] text-md rounded-full py-3 font-semibold text-black transition-colors"
          disabled={!code.trim() || isLoading}
        >
          {
            isLoading ?
              <Pixelate>Analyzing</Pixelate>
              : <Pixelate>Analyze Code</Pixelate>
          }
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default CodeInput;

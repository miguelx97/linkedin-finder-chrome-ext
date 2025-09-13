import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Chip } from "../components/ui/chip";
import { Plus } from "lucide-react";
import { STORAGE_KEYS } from "../global/constants";

function App() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState<string>("");

  useEffect(() => {
    chrome.storage?.sync.get({ [STORAGE_KEYS.KEYWORDS]: [] }, (result) => {
      setKeywords(result[STORAGE_KEYS.KEYWORDS] || []);
    });
  }, []);

  useEffect(() => {
    chrome.storage?.sync.set({ [STORAGE_KEYS.KEYWORDS]: keywords });
  }, [keywords]);

  const handleAddKeyword = () => {
    if (currentKeyword.trim() === "") return;
    setKeywords([...keywords, currentKeyword]);
    setCurrentKeyword("");
  };

  const handleRemoveKeyword = (index: number) => {
    if (index < 0 || index >= keywords.length) return;
    setKeywords([...keywords.slice(0, index), ...keywords.slice(index + 1)]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-80 gap-4 py-4 px-2">
      <h1 className="text-3xl">LinkedIn Finder</h1>
      <div className="flex gap-2 w-full">
        <Input
          type="text"
          placeholder="Enter keyword"
          value={currentKeyword}
          onChange={(e) => setCurrentKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddKeyword();
            }
          }}
        />
        <Button
          className="rounded-full w-14 text-2xl"
          onClick={handleAddKeyword}
        >
          <Plus />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 w-full">
        {keywords.map((keyword, index) => (
          <Chip
            key={index}
            label={keyword}
            variant="primary"
            onRemove={() => handleRemoveKeyword(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Chip } from "../components/ui/chip";
import { Plus } from "lucide-react";
import { DEFAULT, STORAGE_KEYS } from "../global/constants";
import { useKeywordsStore } from "../store/keywords.store";
import useDebounce from "../hooks/useDebounce";

function App() {
  const {
    groups,
    loadFromStorage,
    addGroup,
    addKeywordToGroup,
    removeKeywordFromGroup,
  } = useKeywordsStore();
  const [currentKeyword, setCurrentKeyword] = useState<string>("");
  const [commonCount, setCommonCount] = useState<number | undefined>(undefined);
  const debouncedCommonCount: number | undefined = useDebounce<
    number | undefined
  >(commonCount, 600);

  // Get the default group and its keywords
  const defaultGroup = groups.find(
    (group) => group.name === DEFAULT.GROUP_NAME
  );
  const keywords = defaultGroup?.keywords || [];

  useEffect(() => {
    // Load groups from storage
    loadFromStorage().then(() => {
      // Create default group if no groups exist
      if (groups.length === 0) {
        addGroup(DEFAULT.GROUP_NAME, DEFAULT.GROUP_COLOR);
      }
    });

    // Load commonCount separately (since it's not part of the groups store)
    chrome.storage?.sync.get({ [STORAGE_KEYS.COMMON_COUNT]: 0 }, (result) => {
      setCommonCount(result[STORAGE_KEYS.COMMON_COUNT] || 0);
    });
  }, [loadFromStorage]);

  useEffect(() => {
    // Save commonCount to storage
    if (debouncedCommonCount === undefined) return;
    chrome.storage?.sync.set({
      [STORAGE_KEYS.COMMON_COUNT]: debouncedCommonCount,
    });
  }, [debouncedCommonCount]);

  const handleAddKeyword = () => {
    if (currentKeyword.trim() === "") return;

    // Add keyword to the default group
    addKeywordToGroup(DEFAULT.GROUP_NAME, currentKeyword);
    setCurrentKeyword("");
  };

  const handleRemoveKeyword = (keyword: string) => {
    removeKeywordFromGroup(DEFAULT.GROUP_NAME, keyword);
  };

  return (
    <div className="flex flex-col items-center justify-center w-80 gap-4 py-4 px-2">
      <h1 className="text-3xl">LinkedIn Finder</h1>

      <section className="w-full flex flex-col gap-2">
        <div className="flex gap-2 w-full justify-center">
          <Input
            type="text"
            placeholder="Palabra para resaltar"
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
              onRemove={() => handleRemoveKeyword(keyword)}
            />
          ))}
        </div>
      </section>
      <hr className="w-full" />
      <section className="flex w-full justify-center gap-6">
        <span>
          Resaltar contactos
          <br />
          en común mayor a
        </span>
        <Input
          type="number"
          className="w-20"
          value={commonCount?.toString() || 0}
          onChange={(e) => setCommonCount(Number(e.target.value))}
        />
      </section>
    </div>
  );
}

export default App;

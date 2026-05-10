import { useState } from "react";

import Header from "./components/Header";
import SelectField from "./components/SelectField";
import InputField from "./components/InputField";

import {
  repeatOptions,
  durationOptions,
  positionOptions,
  listOptions,
} from "./data/options";

function App() {

  const [repeat, setRepeat] = useState("Weekly");

  const [duration, setDuration] = useState("2 Weeks");

  const [position, setPosition] = useState("Top");

  const [list, setList] = useState("To Do");

  return (
    <div className="min-h-screen bg-[#1D2125] flex items-center justify-center p-4">

      <div className="w-[360px] animate-[popup_0.25s_ease] bg-[#282E33] border border-[#3B444C] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-5 text-white">

        <Header />

        {/* Select a Card (Search style) */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">
            Select a card
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#22272B] border border-[#3B444C] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none hover:border-[#579DFF] transition"
            />
            <div className="absolute right-3 top-2.5 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
        </div>

        <SelectField
          label="Repeats"
          value={repeat}
          options={repeatOptions}
          onChange={setRepeat}
        />

        <InputField
          label="At"
          type="time"
        />

        <InputField
          label="On"
          type="date"
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Expiry"
            value={duration}
            options={durationOptions}
            onChange={setDuration}
          />

          <SelectField
            label="Position"
            value={position}
            options={positionOptions}
            onChange={setPosition}
          />
        </div>

        <SelectField
          label="List"
          value={list}
          options={listOptions}
          onChange={setList}
        />

        <div className="flex justify-end mt-2">
          <button
            className="bg-[#22272B] hover:bg-[#3B444C] border border-[#3B444C] text-gray-300 text-xs font-medium px-6 py-1.5 rounded-md transition"
          >
            Save
          </button>
        </div>

      </div>

    </div>
  );
}

export default App;
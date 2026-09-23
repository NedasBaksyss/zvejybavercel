import {
  Typography,
  IconButton,
  Tooltip,
  Select,
  Option,
  Switch,
  Input,
  Textarea,
} from "@material-tailwind/react";

import { useState, useContext } from "react";
import { AuthContext, AlertContext } from "@/context";
import { CheckIcon, XMarkIcon, PencilIcon, TrashIcon, FingerPrintIcon } from "@heroicons/react/24/outline";
import { fishingWorld } from "./fishing-spot-fields";
import DialogViewId from "./dialog-view-id";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid";
import DialogViewPossibleFishes from "./dialog-view-possible-fishes";
import DialogEditPossible from "./dialog-edit-possible";

export function AddFishListItem({data, handleSelect, selectedFish}) {
  const { _id, sprite} = data;
  
  const [gamesId, setGamesId] = useState(data.gamesId)
  const [selected, setSelected] = useState(false)

  const [fishSprite, setFishSprite] = useState(sprite ? `/api/images/fish/` + sprite : null);

  const isSelected = selectedFish.some(
    (fish) => fish._id === data._id
  );

  const handleClick = () => {
    handleSelect(data)
  }

  // const { token } = useContext(AuthContext);

    const sprite_element = fishSprite ? (<img src={fishSprite} alt="Sprite" className="h-[100px] w-[100px] [image-rendering:pixelated] " /> 
  ) : (
    <div className="h-[100px] w-[100px] flex items-center justify-center bg-gray-200 border-2 border-gray-600 rounded">
      <span className="text-gray-500 text-lg">X</span>
    </div>
  );

  const classes = isSelected ? "rounded border-2 border-blue-300 bg-gray-100 flex flex-col justify-center items-center p-5 cursor-pointer" : "rounded border-2 border-gray-700 bg-gray-300 flex flex-col justify-center items-center p-5 cursor-pointer"

  return (
    <div className={classes} onClick={() => {handleClick()}}>
        {sprite_element}
        <p>{gamesId}</p>
    </div>
  );
}

export default AddFishListItem;

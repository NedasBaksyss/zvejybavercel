import { useState } from "react";

export function AddFishListItem({data, handleSelect, selectedFish}) {
  const { _id, sprite} = data;
  
  const [fishId, setFishId] = useState(data.fishId)
  const [fishSprite, setFishSprite] = useState(sprite ? `/api/images/fish/` + sprite : null);

  const isSelected = selectedFish.some(
    (fish) => fish._id === data._id
  );

  const handleClick = () => {
    handleSelect(data)
  }

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
        <p>{fishId}</p>
    </div>
  );
}

export default AddFishListItem;

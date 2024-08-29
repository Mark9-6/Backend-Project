import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (
        [name, description].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "Name and description are required")
    }
    const userId = req.user?._id;

    const playlist = await Playlist.create({ name, description, owner: userId });
    if (!playlist) {
        throw new ApiError(500, "Something went wrong")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist created successfully"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "Invalid userId")
    }

    const userPlaylists = await Playlist.find({ owner: userId })

    if (!userPlaylists.length) {
        throw new ApiError(400, "No playlist found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, userPlaylists, "Playlists fetched successfully"));

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(400, "Invalid playlistId")
    }
    const playlist = await Playlist.findById(playlistId)
        .populate("videos")
        .populate("owner", "name");
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200 , playlist , "Playlist fetched successfully"));

})

const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    const {videoId , playlistId} = req.params;
   if(!videoId || !playlistId){
    throw new ApiError(400 , "Invalid playlist or video ID")
   }
   const playlist = await Playlist.findById(playlistId);
   
   if(!playlist ){
    throw new ApiError(400 , "Playlist not found");
   }

   if(playlist.videos.includes(videoId)){
    throw new ApiError(400  , "Video already exists in the playlist");
   }

   playlist.videos.push(videoId)     // pushed the given video id into the found playlist
   await playlist.save({validateBeforeSave: false});

   return res
   .status(200)
   .json(new ApiResponse(200 , playlist , "Video added to playlist successfully"));

})

const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
    const{playlistId , videoId} = req.params;
    if(!videoId || !playlistId){
        throw new ApiError(400 , "Invalid playlist or video ID")
       }

       const playlist = await Playlist.findById(playlistId);
       if(!playlist ){
        throw new ApiError(400 , "Playlist  not found");
       }

        playlist.videos = playlist.videos.filter((v)=> v.toString() !== videoId.toString());  // we can also use splice() in this method
        await playlist.save({validateBeforeSave:false});
        
        return res
        .status(200)
        .json(new ApiResponse(200 , playlist , ""))
})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    if (!playlistId) {
        throw new ApiError(400, "Invalid playlistId")
    }
     const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
     if(!deletedPlaylist){
        throw new ApiError(404 ,"Playlist not found");
     }
     return res
     .status(200)
     .json(new ApiResponse(200 , {} , "Playlist deleted successfully"));

})

const updatePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    const {name , description} = req.body;
    if (!playlistId) {
        throw new ApiError(400, "Invalid playlistId")
    }
    
      const playlist = await  Playlist.findById(playlistId)
      if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }
    playlist.name = name || playlist.name;
    playlist.name = description || playlist.description;
    await playlist.save({validateBeforeSave:false});              // saving is a databse operation hence asynchronous use AWAIT

    return res
    .status(200)
    .json(new ApiResponse(200 , playlist , "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    deletePlaylist,
    updatePlaylist,
    removeVideoFromPlaylist,
    addVideoToPlaylist,
    getPlaylistById
}

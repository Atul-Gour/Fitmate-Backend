import { Router } from "express";
import { isAuthenticated } from "./Authorisation.mjs";
import { MatchData } from "../Mongoose/Schemas/matchDataSchema.mjs";
import { getCoordinates } from "../helper/getCoordinates.mjs";
import { UserData } from "../Mongoose/Schemas/localUserDataSchema.mjs";

const router = Router();


router.post("/api/match/post", isAuthenticated, async (req, res) => {

  

  const {
    matchName,
    sportsType,
    date,
    playersRequired,
    matchType,
    address,
    notes,
  } = req.body;

  const fullAddress = `${address.groundName}, ${address.area}, ${address.city}, ${address.state}, India`;

  const geo = await getCoordinates(fullAddress);

  let existingMatch;

  try {
    existingMatch = await MatchData.findOne({
      matchName,
      sportsType,
      date,
      "address.groundName": address.groundName,
      "address.city": address.city,
      "address.state": address.state,
    });
  } catch (err) {
    return res.status(500).json({ message: "Error while finding the match" });
  }

  if (existingMatch) {
    return res.status(400).json({
      message: "This match already exists at the given time & place.",
    });
  }

  const availableImages = [
  "badminton",
  "basketball",
  "cricket",
  "football",
  "golf",
  "hockey",
  "tennis",
  "volleyball"
];

const sportKey = (sportsType || "").toLowerCase();

const matchImage = availableImages.includes(sportKey)
  ? `/matchuploads/${sportKey}.jpg`
  : `/matchuploads/default-match.jpg`;


  const newMatch = new MatchData({
    matchName,
    sportsType,
    date,
    playersRequired,
    matchType,
    createdBy: req.user.id,
    address: {
      fullAddress: geo?.displayName || fullAddress || "",
      groundName: address.groundName || "",
      area: address.area || "",
      state: address.state || "",
      city: address.city || "",
      coordinates: {
        lat: geo?.lat || "",
        lon: geo?.lon || "",
        mapLink: geo?.mapLink || "",
      },
    },
    notes,
    img: matchImage,
  });

  try {
    const savedMatch = await newMatch.save();
    try {
      const user = await UserData.findOne({ userId: req.user.id });
      await UserData.updateOne(
        { userId: req.user.id },
        {
          $addToSet: {
            matchHistory: {
              matchId: savedMatch._id,
              date: savedMatch.date,
            },
          },
        }
      );
      await MatchData.updateOne(
        { _id: savedMatch._id },
        {
          $addToSet: {
            players: {
              playerId: user.userId,
            },
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ Message: "Error occured while saving" });
  }
  return res.status(201).json({ message: "Match posted successfully" });
});

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.get("/api/match", isAuthenticated, async (req, res) => {
  try {
    const user = await UserData.findOne({ userId: req.user.id });
    if (!user || !user.address.coordinates) {
      return res.status(400).json({ message: "User coordinates not found" });
    }

    const userLat = Number(user.address.coordinates.lat);
    const userLon = Number(user.address.coordinates.lon);

    const matches = await MatchData.find({}).populate({
      path: "createdBy",
      select: "name",
    });
    
    const matchesWithDistance = matches.map((match) => {
      const matchLat = Number(match.address?.coordinates?.lat);
      const matchLon = Number(match.address?.coordinates?.lon);

      if (isNaN(matchLat) || isNaN(matchLon)) {
        console.log(
          `Missing/Invalid coordinates for match: ${match.matchName}`,
          match.address?.coordinates
        );
        return { ...match.toObject(), distance: null };
      }

      const distance = getDistanceFromLatLonInKm(
        userLat,
        userLon,
        matchLat,
        matchLon
      ).toFixed(2);

      return { ...match.toObject(), distance: Number(distance) };
    });

    matchesWithDistance.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    matchesWithDistance.forEach((m) => {
      console.log(`${m.matchName} → ${m.distance} km`);
    });

    res.json(matchesWithDistance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/api/match/join", isAuthenticated, async (req, res) => {
  console.log("Request received:", req.body);
  const { matchName, sportsType, date, address } = req.body;

  try {
    const existingMatch = await MatchData.findOne({
      matchName,
      sportsType,
      date,
      "address.groundName": address.groundName,
      "address.area": address.area,
      "address.city": address.city,
      "address.state": address.state,
    });

    if (!existingMatch) {
      return res.status(404).json({ message: "Match not found" });
    }

    const user = await UserData.findOne({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ message: "Logged-in user not found" });
    }

    const alreadyInMatch = existingMatch.players.some(
      (p) => p.playerId === user.userId
    );

    if (alreadyInMatch) {
      return res
        .status(400)
        .json({ message: "You have already joined this match" });
    }

    await UserData.updateOne(
      { userId: req.user.id },
      {
        $addToSet: {
          matchHistory: {
            matchId: existingMatch._id,
            date: existingMatch.date,
          },
        },
      }
    );

    await MatchData.updateOne(
      { _id: existingMatch._id },
      {
        $addToSet: {
          players: {
            playerId: user.userId,
          },
        },
        $set: {
          playersRequired: Math.max(existingMatch.playersRequired - 1, 0),
        },
      }
    );

    res.status(200).json({ userId:req.user.id, message: "Joined match successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
});

router.get("/api/recommended-matches", isAuthenticated, async (req, res) => {
  try {
    const userData = await UserData.findOne({ userId: req.user.id });
    if (!userData) return res.status(404).json({ message: "User not found" });

    const userSports = (userData.sports || []).map((s) => s.toLowerCase());
    const { city, state } = userData.address;

    let locationFilter = { 
      $or: [
        { "address.city": city },
        { "address.state": state }
      ]
    };

    if (userSports.length > 0) {
      locationFilter.sportsType = { $in: userSports };
    }

    const recommendedMatches = await MatchData.find(locationFilter).sort({ date: 1 });

    res.status(200).json({ recommendedMatches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recommended matches" });
  }
});
export default router;

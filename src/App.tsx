/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import GameScreen from "./components/GameScreen";
import ProfileScreen from "./components/ProfileScreen";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

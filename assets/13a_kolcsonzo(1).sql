-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2024. Nov 13. 11:10
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `13a_kolcsonzo`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `items`
--

CREATE TABLE `items` (
  `item_id` varchar(40) NOT NULL,
  `title` varchar(50) NOT NULL,
  `type` enum('könyv','film') NOT NULL,
  `available` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `items`
--

INSERT INTO `items` (`item_id`, `title`, `type`, `available`) VALUES
('39d1ef71-9fff-11ef-8173-0a0027000008', 'A Gyűrűk Ura: A király visszatér', 'könyv', 0),
('39d1f023-9fff-11ef-8173-0a0027000008', 'Az éhezők viadala', 'könyv', 0),
('39d1f050-9fff-11ef-8173-0a0027000008', 'Interstellar', 'film', 0),
('39d1f07b-9fff-11ef-8173-0a0027000008', '1984', 'könyv', 1),
('39d1f0a2-9fff-11ef-8173-0a0027000008', 'Inception', 'film', 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `rentals`
--

CREATE TABLE `rentals` (
  `rental_id` varchar(40) NOT NULL,
  `user_id` varchar(40) NOT NULL,
  `item_id` varchar(40) NOT NULL,
  `rental_date` date NOT NULL,
  `return_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `rentals`
--

INSERT INTO `rentals` (`rental_id`, `user_id`, `item_id`, `rental_date`, `return_date`) VALUES
('1d518dca-5870-427c-b400-4d22878fd7bb', 'c0ebef71-9fff-11ef-8173-0a0027000008', '39d1ef71-9fff-11ef-8173-0a0027000008', '2024-11-12', '2024-11-12'),
('20c82b0d-a005-11ef-8173-0a0027000008', 'c0ebefb1-9fff-11ef-8173-0a0027000008', '39d1f07b-9fff-11ef-8173-0a0027000008', '2024-11-03', '2024-11-12'),
('28dc29ad-e815-49ba-8269-c7a16c7e3ab0', 'c0ebef71-9fff-11ef-8173-0a0027000008', '39d1ef71-9fff-11ef-8173-0a0027000008', '2024-11-12', '2024-11-12'),
('359b34f0-d9a4-45d0-91e4-35344ea240a7', 'c0ebefb1-9fff-11ef-8173-0a0027000008', '39d1ef71-9fff-11ef-8173-0a0027000008', '2024-11-13', NULL),
('8d307073-0ad7-4485-a553-9eac0329133f', 'c0ebef71-9fff-11ef-8173-0a0027000008', '39d1f07b-9fff-11ef-8173-0a0027000008', '2024-11-12', '2024-11-12'),
('9e03cd73-a64f-4a95-87c5-40905f83a3f2', 'c0ebef71-9fff-11ef-8173-0a0027000008', '39d1f07b-9fff-11ef-8173-0a0027000008', '2024-11-12', '2024-11-12'),
('b0858dd5-12fc-4782-a55d-1465adc834c2', 'c0ebef71-9fff-11ef-8173-0a0027000008', '39d1f050-9fff-11ef-8173-0a0027000008', '2024-11-12', '2024-11-12'),
('bc4628ce-808a-4628-84d6-21be512e21ab', 'c0ebef71-9fff-11ef-8173-0a0027000008', '39d1f050-9fff-11ef-8173-0a0027000008', '2024-11-13', '2024-11-13'),
('c7c17917-da07-44fc-8668-bafa7a67869e', 'c0ebefb1-9fff-11ef-8173-0a0027000008', '39d1f050-9fff-11ef-8173-0a0027000008', '2024-11-13', NULL),
('d51eba6d-c58f-45cc-8ce0-795e17d34ffa', 'c0ebef71-9fff-11ef-8173-0a0027000008', '39d1f050-9fff-11ef-8173-0a0027000008', '2024-11-12', '2024-11-12'),
('def1a7ee-b4c1-40f4-ac83-1ab8bbb601cc', 'c0ebef71-9fff-11ef-8173-0a0027000008', '39d1f050-9fff-11ef-8173-0a0027000008', '2024-11-12', '2024-11-12');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `user_id` varchar(40) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `passwd` varchar(100) NOT NULL,
  `membership_date` date NOT NULL,
  `role` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `passwd`, `membership_date`, `role`) VALUES
('c0ebecc4-9fff-11ef-8173-0a0027000008', 'Nagy János', 'janos@gmail.com', '5503054db09108585089953a43a4b84856b9dff2', '2022-05-10', 'user'),
('c0ebeef5-9fff-11ef-8173-0a0027000008', 'Kovács Éva', 'eva@gmail.com', '5503054db09108585089953a43a4b84856b9dff2', '2021-09-15', 'user'),
('c0ebef71-9fff-11ef-8173-0a0027000008', 'Csurmi', 'csurmi@gmail.com', '5503054db09108585089953a43a4b84856b9dff2', '2023-02-20', 'admin'),
('c0ebef91-9fff-11ef-8173-0a0027000008', 'Szabó Anna', 'anna@gmail.com', '5503054db09108585089953a43a4b84856b9dff2', '2023-06-01', 'user'),
('c0ebefb1-9fff-11ef-8173-0a0027000008', 'Horváth Péter', 'peter@gmail.com', '5503054db09108585089953a43a4b84856b9dff2', '2020-11-22', 'user'),
('c0ebefd0-9fff-11ef-8173-0a0027000008', 'Molnár László', 'laszlo@gmail.com', '5503054db09108585089953a43a4b84856b9dff2', '2019-08-30', 'user');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`item_id`);

--
-- A tábla indexei `rentals`
--
ALTER TABLE `rentals`
  ADD PRIMARY KEY (`rental_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `item_id` (`item_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `rentals`
--
ALTER TABLE `rentals`
  ADD CONSTRAINT `rentals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `rentals_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

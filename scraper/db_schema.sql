--
-- Database: `cars`
--

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ref` varchar(255) NOT NULL,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` varchar(5000) NOT NULL,
  `year` int(4) NOT NULL,
  `link` varchar(5000) NOT NULL,
  `price` int(11) NOT NULL,
  `miles` int(11) NOT NULL,
  `location` varchar(5000) NOT NULL,
  `dealer` varchar(5000) NOT NULL,
  `source` varchar(255) NOT NULL,
  `model` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=0 ;
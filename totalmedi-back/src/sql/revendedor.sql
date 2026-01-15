-- u153960184_totalmedi.revendedor definição

CREATE TABLE `revendedor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_filial` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(255) DEFAULT NULL,
  `pix` varchar(255) DEFAULT NULL,
  `telefone` varchar(25) DEFAULT NULL,
  `unidade_funcional` varchar(25) DEFAULT NULL,
  `matricula` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_revendedor_cpf` (`cpf`),
  KEY `ix_revendedor_filial` (`id_filial`),
  CONSTRAINT `fk_revendedor_filial` FOREIGN KEY (`id_filial`) REFERENCES `filial` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=745 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
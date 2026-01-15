-- u153960184_totalmedi.parceiro definição
CREATE TABLE `parceiro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `agencia` varchar(50) DEFAULT NULL,
  `conta` varchar(50) DEFAULT NULL,
  `digito` varchar(10) DEFAULT NULL,
  `pix` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `logotipo` text DEFAULT NULL,
  `url` varchar(250) DEFAULT NULL,
  `comissao_parceiro` decimal(4,1) NOT NULL DEFAULT 0.0 COMMENT 'Percentual de comissão do parceiro',
  `comissao_revendedor` decimal(4,1) NOT NULL DEFAULT 0.0 COMMENT 'Percentual de comissão do revendedor',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_parceiro_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- filiais
CREATE TABLE `filial` (
  `id`            INT(11) NOT NULL AUTO_INCREMENT,
  `id_parceiro`   INT(11) NOT NULL,
  `titulo`        VARCHAR(255) NOT NULL,
  `apelido`       VARCHAR(100) DEFAULT NULL,
  `endereco`      VARCHAR(500) DEFAULT NULL,
  `email`         VARCHAR(255) NOT NULL,
  `senha`         VARCHAR(255) NOT NULL,
  `ativo`         TINYINT(1)   NOT NULL DEFAULT 1,
  `data_registro` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_filial_email` (`email`),
  KEY `ix_filial_parceiro` (`id_parceiro`),
  CONSTRAINT `fk_filial_parceiro`
    FOREIGN KEY (`id_parceiro`) REFERENCES `parceiro` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- revendedores
CREATE TABLE `revendedor` (
  `id`            INT(11) NOT NULL AUTO_INCREMENT,
  `id_filial`     INT(11) NOT NULL,
  `nome`          VARCHAR(255) NOT NULL,
  `cpf`           VARCHAR(14)  NOT NULL,
  `cargo`         VARCHAR(100) DEFAULT NULL,
  `email`         VARCHAR(255) NOT NULL,
  `pix`           VARCHAR(255) DEFAULT NULL,
  `senha`         VARCHAR(255) NOT NULL,
  `ativo`         TINYINT(1)   NOT NULL DEFAULT 1,
  `data_registro` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_revendedor_cpf` (`cpf`),
  KEY `ix_revendedor_filial` (`id_filial`),
  CONSTRAINT `fk_revendedor_filial`
    FOREIGN KEY (`id_filial`) REFERENCES `filial` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE `venda` (
  `id`              INT(11) NOT NULL AUTO_INCREMENT,
  `id_revendedor`   INT(11) NOT NULL,
  `cpf_beneficiario` VARCHAR(14) NOT NULL,
  `valor`           DECIMAL(10,2) NOT NULL,
  `tipo`            VARCHAR(100) NOT NULL,
  `data_hora`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uuid`            VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  KEY `ix_venda_revendedor` (`id_revendedor`),
  CONSTRAINT `fk_venda_revendedor`
    FOREIGN KEY (`id_revendedor`) REFERENCES `revendedor` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

CREATE TABLE comissao_plano (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_parceiro INT NOT NULL,
  plano VARCHAR(100) NOT NULL, -- ex: 'plano_individual', 'plano_familiar'
  comissao_parceiro DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  comissao_revendedor DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  FOREIGN KEY (id_parceiro) REFERENCES parceiro(id) ON DELETE CASCADE
);

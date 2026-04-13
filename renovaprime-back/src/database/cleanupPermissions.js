require('dotenv').config();
const sequelize = require('../config/database');

async function cleanupPermissions() {
  try {
    console.log('🔄 Iniciando limpeza do sistema de permissões...\n');
    
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.\n');

    // Deletar registros da tabela role_permissions
    console.log('🗑️  Deletando registros de role_permissions...');
    await sequelize.query('DELETE FROM role_permissions;');
    console.log('✓ Registros de role_permissions deletados.\n');

    // Dropar tabela role_permissions
    console.log('🗑️  Dropando tabela role_permissions...');
    await sequelize.query('DROP TABLE IF EXISTS role_permissions;');
    console.log('✓ Tabela role_permissions removida.\n');

    // Deletar registros da tabela permissions
    console.log('🗑️  Deletando registros de permissions...');
    await sequelize.query('DELETE FROM permissions;');
    console.log('✓ Registros de permissions deletados.\n');

    // Dropar tabela permissions
    console.log('🗑️  Dropando tabela permissions...');
    await sequelize.query('DROP TABLE IF EXISTS permissions;');
    console.log('✓ Tabela permissions removida.\n');

    console.log('✅ Limpeza concluída com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Remover models de Permission e RolePermission');
    console.log('   2. Atualizar models/index.js removendo associações');
    console.log('   3. Remover seedPermissions.js\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error.message);
    console.error('\n💡 Dica: Certifique-se de que o banco de dados está rodando e as tabelas existem.\n');
    process.exit(1);
  }
}

cleanupPermissions();

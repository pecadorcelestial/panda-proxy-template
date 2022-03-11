#!/src/scripts/change-version.sh
# Se solicita el tipo de cambio en la versión.

# echo ¿Qué tipo de cambio es?
# echo \(major \| minor \| patch \| premajor \| preminor \| prepatch \| prerelease\)

# read version

echo \"This is bad, there is a block of code missing...\"
echo ʕ •ᴥ•ʔノ I guess you could say,
echo ʕ •ᴥ•ʔノ you\'ll need to PATCH this version...
echo ʕ •ᴥ•ʔっ⌐■-■
echo ʕ⌐■ᴥ■ʔ   yeeeaaahhh...

# npm version $version --force
# NOTA: Se agrega la bandera "--no-commit-hooks" ya que el comando "npm version" detona un
#       "commit" y esto se cicla... ¯\_(ツ)_/¯
# npm version --no-commit-hooks --no-git-tag-version patch --force

# exit 0
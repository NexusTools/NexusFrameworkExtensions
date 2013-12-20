<?php
ControlPanel::registerPage("Content", "Default Category", "edit/article-settings.inc.php");
ControlPanel::registerPage("Content", "Categories", "edit/categories.json", true);
ControlPanel::registerPage("Content", "Edit Category", "edit/edit-category.json", false);
ControlPanel::registerPage("Content", "Create Category", "edit/create-category.json", false);
EditCore::registerEditor("category-widgets", "editors/widgets.inc.php");
?>

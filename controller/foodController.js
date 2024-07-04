import { v4 as uuidv4 } from 'uuid';

class FoodController {
    constructor(name) {
        // base url to fetch menu items
        this.baseURL = 'https://openmenu.com/api/v2/restaurant.php';
        // name of the restaurant to help query the menu
        this.name = name;
    }
    
    // Get all menu items
    getAllItems(req, res) {
        res.json(this.menu);
    }

    // Get a specific item by ID
    getItem(req, res) {
        const id = req.params.id;
        const item = this.menu.find(item => item.id === id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    }

    // Get items by category
    getItemsByCategory(req, res) {
        const category = req.params.category;
        const items = this.menu.filter(item => item.category.toLowerCase() === category.toLowerCase());
        res.json(items);
    }

    // Get all categories
    getCategories(req, res) {
        const categories = [...new Set(this.menu.map(item => item.category))];
        res.json(categories);
    }

    // Search items
    searchItems(req, res) {
        const searchTerm = req.query.q.toLowerCase();
        const results = this.menu.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.description.toLowerCase().includes(searchTerm)
        );
        res.json(results);
    }
}

export default new FoodController();
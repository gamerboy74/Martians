import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoveUp, MoveDown, Image } from 'lucide-react';
import { Dialog } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';

interface FeaturedGame {
  id: string;
  title: string;
  category: string;
  image_url: string;
  tournaments_count: number;
  players_count: string;
  sort_order: number;
}

interface GameFormData {
  title: string;
  category: string;
  image_url: string;
  tournaments_count: number;
  players_count: string;
}

const FeaturedGames: React.FC = () => {
  const [games, setGames] = useState<FeaturedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<FeaturedGame | null>(null);
  const [formData, setFormData] = useState<GameFormData>({
    title: '',
    category: '',
    image_url: '',
    tournaments_count: 0,
    players_count: '0'
  });
  const toast = useToast();

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('featured_games')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to fetch featured games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGame) {
        const { error } = await supabase
          .from('featured_games')
          .update(formData)
          .eq('id', editingGame.id);

        if (error) throw error;
        toast.success('Game updated successfully');
      } else {
        const { error } = await supabase
          .from('featured_games')
          .insert([{ ...formData, sort_order: games.length }]);

        if (error) throw error;
        toast.success('Game added successfully');
      }

      setIsDialogOpen(false);
      setEditingGame(null);
      setFormData({
        title: '',
        category: '',
        image_url: '',
        tournaments_count: 0,
        players_count: '0'
      });
      fetchGames();
    } catch (error) {
      console.error('Error saving game:', error);
      toast.error('Failed to save game');
    }
  };

  const handleEdit = (game: FeaturedGame) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      category: game.category,
      image_url: game.image_url,
      tournaments_count: game.tournaments_count,
      players_count: game.players_count
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const { error } = await supabase
        .from('featured_games')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Game deleted successfully');
      fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = games.findIndex(game => game.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === games.length - 1)
    ) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newGames = [...games];
    const temp = newGames[currentIndex];
    newGames[currentIndex] = newGames[newIndex];
    newGames[newIndex] = temp;

    try {
      const updates = newGames.map((game, index) => ({
        id: game.id,
        sort_order: index
      }));

      const { error } = await supabase
        .from('featured_games')
        .upsert(updates);

      if (error) throw error;
      fetchGames();
    } catch (error) {
      console.error('Error reordering games:', error);
      toast.error('Failed to reorder games');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Featured Games</h1>
        <Button
          onClick={() => {
            setEditingGame(null);
            setFormData({
              title: '',
              category: '',
              image_url: '',
              tournaments_count: 0,
              players_count: '0'
            });
            setIsDialogOpen(true);
          }}
          leftIcon={<Plus className="h-5 w-5" />}
        >
          Add Game
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="aspect-video relative">
              <img
                src={game.image_url}
                alt={game.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="px-2 py-1 bg-purple-500/80 text-white text-sm rounded-full">
                  {game.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{game.title}</h3>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{game.tournaments_count} Tournaments</span>
                <span>{game.players_count} Players</span>
              </div>

              <div className="mt-4 flex justify-between">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMove(game.id, 'up')}
                    disabled={games.indexOf(game) === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMove(game.id, 'down')}
                    disabled={games.indexOf(game) === games.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEdit(game)}
                    leftIcon={<Edit className="h-4 w-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(game.id)}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingGame(null);
          setFormData({
            title: '',
            category: '',
            image_url: '',
            tournaments_count: 0,
            players_count: '0'
          });
        }}
        title={editingGame ? 'Edit Featured Game' : 'Add Featured Game'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md text-gray-900 border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="flex-1 block w-full text-gray-900 rounded-l-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => window.open(formData.image_url, '_blank')}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:text-gray-700"
              >
                <Image className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tournaments Count
            </label>
            <input
              type="number"
              value={formData.tournaments_count.toString()}
              onChange={(e) => setFormData({ ...formData, tournaments_count: e.target.value ? parseInt(e.target.value) : 0 })}
              className="mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Players Count (with suffix, e.g., "10K+")
            </label>
            <input
              type="text"
              value={formData.players_count}
              onChange={(e) => setFormData({ ...formData, players_count: e.target.value })}
              className="mt-1 block text-gray-900 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingGame(null);
                setFormData({
                  title: '',
                  category: '',
                  image_url: '',
                  tournaments_count: 0,
                  players_count: '0'
                });
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingGame ? 'Update' : 'Add'} Game
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default FeaturedGames;
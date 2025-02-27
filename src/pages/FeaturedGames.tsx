import React, { useState, useEffect } from 'react';
import { Plus, Search, Trophy, Edit, Trash2, MoveUp, MoveDown, Image } from 'lucide-react';
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
        .order('sort_order', { ascending: true });

      if (error) throw error;
      console.log('Fetched games:', data);
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

      // Reorder remaining games after deletion
      const remainingGames = games.filter(game => game.id !== id).map((game, index) => ({
        ...game,
        sort_order: index
      }));
      console.log('Reordering after deletion:', remainingGames);
      const { error: upsertError } = await supabase.from('featured_games').upsert(remainingGames);
      if (upsertError) throw upsertError;

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
    const [movedGame] = newGames.splice(currentIndex, 1); // Remove the game from its current position
    newGames.splice(newIndex, 0, movedGame); // Insert it at the new position

    // Update sort_order for all games
    const updatedGames = newGames.map((game, index) => ({
      id: game.id,
      title: game.title, // Include all required fields
      category: game.category,
      image_url: game.image_url,
      tournaments_count: game.tournaments_count,
      players_count: game.players_count,
      sort_order: index
    }));

    try {
      console.log('Attempting to reorder games:', updatedGames);
      const { error } = await supabase
        .from('featured_games')
        .upsert(updatedGames, { onConflict: 'id' }); // Specify 'id' as the conflict key

      if (error) throw error;
      console.log('Successfully reordered games');
      setGames(updatedGames); // Update UI immediately
      toast.success(`Game moved ${direction} successfully`);
    } catch (error) {
      console.error('Error reordering games:', error);
      toast.error('Failed to reorder games');
      fetchGames(); // Re-fetch to ensure consistency on error
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-purple-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-purple-700 opacity-60"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-purple-500/20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in">
            Featured Games
          </h1>
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
            leftIcon={<Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />}
            className="group w-full sm:w-auto px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
          >
            Add Game
          </Button>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white/95 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200/50 transform hover:-translate-y-1"
            >
              <div className="aspect-video relative">
                <img
                  src={game.image_url}
                  alt={game.title}
                  className="w-full h-full object-cover hover:brightness-110 transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                  <span className="px-2 py-1 bg-purple-500/80 text-white text-xs sm:text-sm rounded-full shadow-sm">
                    {game.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1 sm:mt-2 truncate">{game.title}</h3>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                  <span>{game.tournaments_count} Tournaments</span>
                  <span>{game.players_count} Players</span>
                </div>

                <div className="mt-4 flex justify-between gap-2 sm:gap-4">
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMove(game.id, 'up')}
                      disabled={games.indexOf(game) === 0}
                      className="p-2 text-gray-600 rounded-full shadow-md hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MoveUp className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMove(game.id, 'down')}
                      disabled={games.indexOf(game) === games.length - 1}
                      className="p-2 text-gray-600 rounded-full shadow-md hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MoveDown className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                    </Button>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(game)}
                      leftIcon={<Edit className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                      className="group px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(game.id)}
                      className="group px-3 sm:px-4 py-1 sm:py-2 text-red-600 rounded-full shadow-md hover:bg-red-100 hover:text-red-900 transition-all duration-300"
                      leftIcon={<Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Dialog */}
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
          className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-2xl max-w-md mx-auto p-4 sm:p-6 border border-gray-200/50 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100"
        >
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 animate-slide-in">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">
                Image URL
              </label>
              <div className="mt-1 flex rounded-xl shadow-md overflow-hidden">
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="flex-1 block w-full px-3 py-2 sm:py-3 rounded-l-xl bg-white/90 border border-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => window.open(formData.image_url, '_blank')}
                  className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-3 border border-l-0 border-gray-200 rounded-r-xl bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-300"
                >
                  <Image className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 hover:scale-110" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">
                Tournaments Count
              </label>
              <input
                type="number"
                value={formData.tournaments_count.toString()}
                onChange={(e) => setFormData({ ...formData, tournaments_count: e.target.value ? parseInt(e.target.value) : 0 })}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">
                Players Count (with suffix, e.g., "10K+")
              </label>
              <input
                type="text"
                value={formData.players_count}
                onChange={(e) => setFormData({ ...formData, players_count: e.target.value })}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                required
              />
            </div>

            <div className="mt-4 sm:mt-6 flex justify-end gap-2 sm:gap-3">
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
                className="px-3 sm:px-4 py-1 sm:py-2 text-gray-700 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
              >
                {editingGame ? 'Update' : 'Add'} Game
              </Button>
            </div>
          </form>
        </Dialog>
      </div>

      <style >{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-slow {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-in { animation: slide-in 0.5s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s infinite ease-in-out; }

        /* Responsive Adjustments for Small Devices */
        @media (max-width: 640px) {
          .space-y-6 > * + * {
            margin-top: 1rem;
          }
          .p-6 {
            padding: 0.75rem;
          }
          .text-3xl {
            font-size: 1.5rem;
          }
          .text-lg {
            font-size: 1rem;
          }
          .text-sm {
            font-size: 0.75rem;
          }
          .text-xs {
            font-size: 0.65rem;
          }
          .w-16 {
            width: 2.5rem;
            height: 2.5rem;
          }
          .gap-6 {
            gap: 1rem;
          }
          .py-3 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .max-w-md {
            max-width: 100%;
          }
          .gap-4 {
            gap: 0.75rem;
          }
          .aspect-video {
            height: 8rem;
          }
          .bottom-4 {
            bottom: 0.75rem;
          }
          .left-4 {
            left: 0.75rem;
          }
          .right-4 {
            right: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FeaturedGames;
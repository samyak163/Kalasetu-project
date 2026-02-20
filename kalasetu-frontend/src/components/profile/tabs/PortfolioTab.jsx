import { useEffect, useState, useContext, useRef } from 'react';
import { ToastContext } from '../../../context/ToastContext.jsx';
import api from '../../../lib/axios.js';
import { optimizeImage } from '../../../utils/cloudinary.js';
import { Card, Button, Input, Skeleton, EmptyState, Badge, BottomSheet } from '../../ui';
import { Plus, Trash2, Star, GripHorizontal, ImagePlus, Image } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category' },
  { value: 'Pottery', label: 'Pottery' },
  { value: 'Weaving', label: 'Weaving' },
  { value: 'Jewelry', label: 'Jewelry' },
  { value: 'Woodwork', label: 'Woodwork' },
  { value: 'Painting', label: 'Painting' },
  { value: 'Sculpture', label: 'Sculpture' },
  { value: 'Textiles & Weaving', label: 'Textiles & Weaving' },
  { value: 'Pottery & Ceramics', label: 'Pottery & Ceramics' },
  { value: 'Other', label: 'Other' },
];

const PortfolioTab = () => {
  const { showToast } = useContext(ToastContext);
  const fileInputRefs = useRef({});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [draggedImage, setDraggedImage] = useState(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'project'|'image', projectId, imageUrl? }

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/artisan/portfolio/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showToast('Failed to load portfolio projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files, projectId) => {
    if (!files || files.length === 0) return;

    const project = projects.find(p => p._id === projectId);
    if (project && project.images && project.images.length + files.length > 20) {
      showToast('Maximum 20 images per project', 'error');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedUrls = [];

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          showToast(`${file.name} is not an image file`, 'error');
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          showToast(`${file.name} is too large (max 5MB)`, 'error');
          continue;
        }

        const sigResponse = await api.get('/api/uploads/signature', {
          params: { folder: 'portfolio' }
        });
        const { signature, timestamp, cloudName, api_key } = sigResponse.data;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('api_key', api_key);
        formData.append('folder', 'portfolio');

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        );

        const uploadData = await uploadResponse.json();
        if (uploadData.secure_url) {
          uploadedUrls.push(uploadData.secure_url);
        }
      }

      if (uploadedUrls.length > 0) {
        await api.post(`/api/artisan/portfolio/projects/${projectId}/images`, {
          images: uploadedUrls
        });
        showToast(`Successfully uploaded ${uploadedUrls.length} image(s)`, 'success');
        fetchProjects();
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showToast('Failed to upload images. Please try again.', 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      await api.post('/api/artisan/portfolio/projects', projectData);
      showToast('Project created successfully', 'success');
      fetchProjects();
      setShowAddProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
      showToast(error.response?.data?.error || 'Failed to create project', 'error');
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await api.delete(`/api/artisan/portfolio/projects/${projectId}`);
      showToast('Project deleted successfully', 'success');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Failed to delete project', 'error');
    }
  };

  const deleteImage = async (projectId, imageUrl) => {
    try {
      await api.delete(`/api/artisan/portfolio/projects/${projectId}/images`, {
        data: { imageUrl }
      });
      showToast('Image deleted successfully', 'success');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast('Failed to delete image', 'error');
    }
  };

  const setCoverImage = async (projectId, imageUrl) => {
    try {
      await api.patch(`/api/artisan/portfolio/projects/${projectId}/cover`, {
        coverImage: imageUrl
      });
      showToast('Cover image updated', 'success');
      fetchProjects();
    } catch (error) {
      console.error('Error setting cover image:', error);
      showToast('Failed to set cover image', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'project') {
      await deleteProject(deleteConfirm.projectId);
    } else if (deleteConfirm.type === 'image') {
      await deleteImage(deleteConfirm.projectId, deleteConfirm.imageUrl);
    }
    setDeleteConfirm(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e, imageUrl) => {
    setDraggedImage(imageUrl);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedImage(null);
    setDraggedOverIndex(null);
  };

  const handleDrop = async (e, projectId, dropIndex) => {
    e.preventDefault();

    if (!draggedImage) return;

    const project = projects.find(p => p._id === projectId);
    if (!project || !project.images) return;

    const currentIndex = project.images.indexOf(draggedImage);
    if (currentIndex === -1 || currentIndex === dropIndex) {
      setDraggedImage(null);
      setDraggedOverIndex(null);
      return;
    }

    const items = Array.from(project.images);
    const [reorderedItem] = items.splice(currentIndex, 1);
    items.splice(dropIndex, 0, reorderedItem);

    setProjects(projects.map(p =>
      p._id === projectId ? { ...p, images: items } : p
    ));

    try {
      await api.patch(`/api/artisan/portfolio/projects/${projectId}/reorder`, {
        images: items
      });
      showToast('Images reordered successfully', 'success');
    } catch (error) {
      console.error('Error reordering images:', error);
      showToast('Failed to reorder images', 'error');
      fetchProjects();
    }

    setDraggedImage(null);
    setDraggedOverIndex(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" height="28px" width="250px" />
        <div className="grid grid-cols-1 gap-6">
          {[1, 2].map(i => <Skeleton key={i} variant="rect" height="240px" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-gray-900">Portfolio & Gallery</h2>
          <p className="text-sm text-gray-500 mt-1">Showcase your best work to attract customers</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddProject(true)}>
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      </div>

      {/* Projects */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<Image className="h-16 w-16" />}
          title="No portfolio projects yet"
          description="Start showcasing your work to attract more customers"
          action={
            <Button variant="primary" onClick={() => setShowAddProject(true)}>
              Create Your First Project
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <Card key={project._id} hover={false}>
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge status={project.isPublic ? 'confirmed' : 'rejected'}>
                      {project.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <span className="text-xs text-gray-400">{project.category}</span>
                    <span className="text-xs text-gray-400">{project.images?.length || 0} images</span>
                    <span className="text-xs text-gray-400">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={uploadingImages}
                    onClick={() => fileInputRefs.current[project._id]?.click()}
                  >
                    <ImagePlus className="h-4 w-4" /> Add Images
                  </Button>
                  <input
                    ref={el => { fileInputRefs.current[project._id] = el; }}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(Array.from(e.target.files), project._id)}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteConfirm({ type: 'project', projectId: project._id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Images Grid with Drag & Drop */}
              {project.images && project.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {project.images.map((image, index) => (
                    <div
                      key={image}
                      draggable
                      onDragStart={(e) => handleDragStart(e, image)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, project._id, index)}
                      className={`relative group cursor-move ${draggedImage === image ? 'opacity-50' : ''} ${draggedOverIndex === index ? 'ring-2 ring-brand-500 rounded-lg' : ''}`}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={optimizeImage(image, { width: 200, height: 200 })}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {project.coverImage !== image && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setCoverImage(project._id, image); }}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title="Set as cover"
                          >
                            <Star className="h-4 w-4 text-warning-500" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'image', projectId: project._id, imageUrl: image }); }}
                          className="p-2 bg-white rounded-full hover:bg-error-50 transition-colors"
                          title="Delete image"
                        >
                          <Trash2 className="h-4 w-4 text-error-600" />
                        </button>
                      </div>
                      {/* Cover Badge */}
                      {project.coverImage === image && (
                        <div className="absolute top-1.5 left-1.5">
                          <Badge status="pending">Cover</Badge>
                        </div>
                      )}
                      {/* Drag Handle */}
                      <div className="absolute top-1.5 right-1.5 p-1 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripHorizontal className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <Image className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 mb-3">No images in this project yet</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRefs.current[project._id]?.click()}
                  >
                    Upload Images
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Project BottomSheet */}
      <AddProjectSheet
        open={showAddProject}
        onClose={() => setShowAddProject(false)}
        onSubmit={createProject}
      />

      {/* Delete Confirmation BottomSheet */}
      <BottomSheet
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={deleteConfirm?.type === 'project' ? 'Delete Project' : 'Delete Image'}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {deleteConfirm?.type === 'project'
              ? 'Are you sure you want to delete this project? This cannot be undone and all images will be permanently removed.'
              : 'Are you sure you want to delete this image? This cannot be undone.'
            }
          </p>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={handleDeleteConfirm}>
              Delete
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

// Add Project BottomSheet
const AddProjectSheet = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      return;
    }
    onSubmit(formData);
    setFormData({ title: '', description: '', category: '', isPublic: true });
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Custom Pottery Collection 2025"
          required
        />
        <Input
          label="Description"
          as="textarea"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe this project..."
          rows={3}
        />
        <Input
          label="Category *"
          as="select"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          options={CATEGORY_OPTIONS}
          required
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="rounded text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-700">Make this project public on my profile</span>
        </label>
        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" className="flex-1">
            Create Project
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};

export default PortfolioTab;

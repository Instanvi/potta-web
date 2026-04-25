'use client';
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Settings, X } from 'lucide-react';
import { forecastingService } from '../../../../services/forecastingService';
import type {
  Scenario,
  CreateScenarioRequest,
  CreateAdjustmentRequest,
} from '../../../../services/forecastingService';

interface ScenarioManagerProps {
  scenarios: Scenario[];
  selectedScenario: string;
  organizationId: string;
  onScenarioChange: (scenarioId: string) => void;
  onScenariosUpdate: (scenarios: Scenario[]) => void;
}

const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  scenarios,
  selectedScenario,
  organizationId,
  onScenarioChange,
  onScenariosUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'adjustments'>(
    'create'
  );
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    notes: '',
  });

  const [adjustmentData, setAdjustmentData] = useState({
    target_metric: 'revenue',
    rule_type: 'percent_change',
    value_expr: '+10%',
    priority: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      notes: '',
    });
    setAdjustmentData({
      target_metric: 'revenue',
      rule_type: 'percent_change',
      value_expr: '+10%',
      priority: 0,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setEditingScenario(null);
    setIsModalOpen(true);
  };

  const openEditModal = (scenario: Scenario) => {
    setFormData({
      name: scenario.name,
      start_date: scenario.start_date,
      end_date: scenario.end_date,
      notes: scenario.notes,
    });
    setModalMode('edit');
    setEditingScenario(scenario);
    setIsModalOpen(true);
  };

  const openAdjustmentsModal = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setModalMode('adjustments');
    setIsModalOpen(true);
  };

  const handleCreateScenario = async () => {
    try {
      setLoading(true);

      const request: CreateScenarioRequest = {
        ...formData,
        organization_id: organizationId,
      };

      await forecastingService.createScenario(request);

      // Refresh scenarios
      const updatedScenarios = await forecastingService.getScenarios(
        organizationId
      );
      onScenariosUpdate(updatedScenarios.scenarios);

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScenario = async () => {
    if (!editingScenario) return;

    try {
      setLoading(true);

      const request: CreateScenarioRequest = {
        ...formData,
        organization_id: organizationId,
      };

      await forecastingService.updateScenario(
        editingScenario.scenario_id,
        request
      );

      // Refresh scenarios
      const updatedScenarios = await forecastingService.getScenarios(
        organizationId
      );
      onScenariosUpdate(updatedScenarios.scenarios);

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;

    try {
      setLoading(true);
      await forecastingService.deleteScenario(scenarioId, organizationId);

      // Refresh scenarios
      const updatedScenarios = await forecastingService.getScenarios(
        organizationId
      );
      onScenariosUpdate(updatedScenarios.scenarios);

      // If deleted scenario was selected, switch to main
      if (selectedScenario === scenarioId) {
        onScenarioChange('main');
      }
    } catch (error) {
      console.error('Error deleting scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdjustment = async () => {
    if (!editingScenario) return;

    try {
      setLoading(true);

      const request: CreateAdjustmentRequest = {
        ...adjustmentData,
        organization_id: organizationId,
      };

      await forecastingService.addAdjustment(
        editingScenario.scenario_id,
        request
      );

      // Refresh scenarios
      const updatedScenarios = await forecastingService.getScenarios(
        organizationId
      );
      onScenariosUpdate(updatedScenarios.scenarios);

      // Reset adjustment form
      setAdjustmentData({
        target_metric: 'revenue',
        rule_type: 'percent_change',
        value_expr: '+10%',
        priority: 0,
      });
    } catch (error) {
      console.error('Error adding adjustment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdjustment = async (driverId: string) => {
    try {
      setLoading(true);
      await forecastingService.deleteAdjustment(driverId, organizationId);

      // Refresh scenarios
      const updatedScenarios = await forecastingService.getScenarios(
        organizationId
      );
      onScenariosUpdate(updatedScenarios.scenarios);
    } catch (error) {
      console.error('Error deleting adjustment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Scenario List */}
      <div className="bg-white p-6 -xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Forecast Scenarios
          </h3>
          <button
            onClick={openCreateModal}
            className="flex items-center px-3 py-2 bg-blue-600 text-white -lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </button>
        </div>

        <div className="space-y-3">
          {/* Main Scenario */}
          <div
            className={`p-4 -lg border-2 transition-colors ${
              selectedScenario === 'main'
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Main Scenario</h4>
                <p className="text-sm text-gray-600">
                  Base forecast without adjustments
                </p>
              </div>
              <button
                onClick={() => onScenarioChange('main')}
                className={`px-3 py-1 -md text-sm transition-colors ${
                  selectedScenario === 'main'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {selectedScenario === 'main' ? 'Active' : 'Select'}
              </button>
            </div>
          </div>

          {/* Custom Scenarios */}
          {scenarios.map((scenario) => (
            <div
              key={scenario.scenario_id}
              className={`p-4 -lg border-2 transition-colors ${
                selectedScenario === scenario.scenario_id
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                  <p className="text-sm text-gray-600">{scenario.notes}</p>
                  {scenario.adjustments.length > 0 && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 -full text-xs font-medium bg-green-100 text-green-800">
                        {scenario.adjustments.length} adjustment
                        {scenario.adjustments.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openAdjustmentsModal(scenario)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Manage Adjustments"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(scenario)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit Scenario"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteScenario(scenario.scenario_id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Scenario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onScenarioChange(scenario.scenario_id)}
                    className={`px-3 py-1 -md text-sm transition-colors ${
                      selectedScenario === scenario.scenario_id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {selectedScenario === scenario.scenario_id
                      ? 'Active'
                      : 'Select'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 -xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {modalMode === 'create' && 'Create New Scenario'}
                {modalMode === 'edit' && 'Edit Scenario'}
                {modalMode === 'adjustments' && 'Manage Adjustments'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalMode !== 'adjustments' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scenario Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter scenario name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter scenario description"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 -md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      modalMode === 'create'
                        ? handleCreateScenario
                        : handleUpdateScenario
                    }
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white -md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading
                      ? 'Saving...'
                      : modalMode === 'create'
                      ? 'Create'
                      : 'Update'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Existing Adjustments */}
                {editingScenario?.adjustments.map((adjustment: any) => (
                  <div
                    key={adjustment.driver_id}
                    className="p-3 border border-gray-200 -lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {adjustment.target_metric}: {adjustment.value_expr}
                        </div>
                        <div className="text-sm text-gray-600">
                          {adjustment.rule_type} (Priority:{' '}
                          {adjustment.priority})
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteAdjustment(adjustment.driver_id)
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add New Adjustment */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Add New Adjustment
                  </h4>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Metric
                      </label>
                      <select
                        value={adjustmentData.target_metric}
                        onChange={(e) =>
                          setAdjustmentData({
                            ...adjustmentData,
                            target_metric: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="revenue">Revenue</option>
                        <option value="cogs">COGS</option>
                        <option value="opex">OpEx</option>
                        <option value="salary_expense">Salary</option>
                        <option value="tax">Tax</option>
                        <option value="gross_profit">Gross Profit</option>
                        <option value="operating_profit">
                          Operating Profit
                        </option>
                        <option value="net_income">Net Income</option>
                        <option value="ocf">Operating Cash Flow</option>
                        <option value="capex">CapEx</option>
                        <option value="fcf">Free Cash Flow</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adjustment
                      </label>
                      <input
                        type="text"
                        value={adjustmentData.value_expr}
                        onChange={(e) =>
                          setAdjustmentData({
                            ...adjustmentData,
                            value_expr: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 -md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+10%"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddAdjustment}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-600 text-white -md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Adjustment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioManager;
